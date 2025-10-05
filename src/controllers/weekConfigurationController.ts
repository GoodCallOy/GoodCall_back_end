import { Request, Response } from 'express';
import WeekConfiguration from '../models/weekConfiguration';
import { IWeekConfigurationCreate, IWeekConfigurationUpdate, IWeekConfigurationQuery } from '../types/IWeekConfiguration';
import { Types } from 'mongoose';

// Get all week configurations
export const getAllWeekConfigurations = async (req: Request, res: Response) => {
  try {
    const { year, month, isActive, isDefault, createdBy } = req.query as IWeekConfigurationQuery;
    
    // Build query object
    const query: any = {};
    if (year) query.year = parseInt(year.toString());
    if (month) query.month = parseInt(month.toString());
    if (isActive !== undefined) query['weeks.isActive'] = String(isActive) === 'true';
    if (isDefault !== undefined) query.isDefault = String(isDefault) === 'true';
    if (createdBy) query.createdBy = new Types.ObjectId(createdBy);

    const configurations = await WeekConfiguration.find(query)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: configurations.length,
      data: configurations
    });
  } catch (error: any) {
    console.error('Error fetching week configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch week configurations',
      error: error.message
    });
  }
};

// Get week configuration by ID
export const getWeekConfigurationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration ID'
      });
    }

    const configuration = await WeekConfiguration.findById(id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: 'Week configuration not found'
      });
    }

    res.status(200).json({
      success: true,
      data: configuration
    });
  } catch (error: any) {
    console.error('Error fetching week configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch week configuration',
      error: error.message
    });
  }
};

// Get week configuration by year and month
export const getWeekConfigurationByYearMonth = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.params;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year or month'
      });
    }

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12'
      });
    }

    const configuration = await WeekConfiguration.findByYearAndMonth(yearNum, monthNum);
    if (configuration) {
      await (configuration as any).populate('createdBy', 'name email');
      await (configuration as any).populate('lastModifiedBy', 'name email');
    }

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: `No week configuration found for ${year}/${month}`
      });
    }

    res.status(200).json({
      success: true,
      data: configuration
    });
  } catch (error: any) {
    console.error('Error fetching week configuration by year/month:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch week configuration',
      error: error.message
    });
  }
};

// Get default week configuration
export const getDefaultWeekConfiguration = async (req: Request, res: Response) => {
  try {
    const configuration = await WeekConfiguration.findDefault();
    if (configuration) {
      await (configuration as any).populate('createdBy', 'name email');
      await (configuration as any).populate('lastModifiedBy', 'name email');
    }

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: 'No default week configuration found'
      });
    }

    res.status(200).json({
      success: true,
      data: configuration
    });
  } catch (error: any) {
    console.error('Error fetching default week configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch default week configuration',
      error: error.message
    });
  }
};

// Create new week configuration
export const createWeekConfiguration = async (req: Request, res: Response) => {
  try {
    const configurationData: IWeekConfigurationCreate = req.body;
    const userId = (req as any).user?.id || (req as any).gcAgent?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Validate required fields
    if (!configurationData.year || !configurationData.month || !configurationData.weeks) {
      return res.status(400).json({
        success: false,
        message: 'Year, month, and weeks are required'
      });
    }

    // Validate month range
    if (configurationData.month < 1 || configurationData.month > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12'
      });
    }

    // Check if configuration already exists for this year/month
    const existingConfig = await WeekConfiguration.findByYearAndMonth(
      configurationData.year, 
      configurationData.month
    );

    if (existingConfig) {
      return res.status(409).json({
        success: false,
        message: `Week configuration already exists for ${configurationData.year}/${configurationData.month}`
      });
    }

    // If this is being set as default, unset other defaults
    if (configurationData.isDefault) {
      await WeekConfiguration.updateMany({}, { isDefault: false });
    }

    // Create the configuration
    const newConfiguration = new WeekConfiguration({
      ...configurationData,
      createdBy: new Types.ObjectId(userId),
      lastModifiedBy: new Types.ObjectId(userId)
    });

    // Validate week ranges
    if (!(newConfiguration as any).validateWeekRanges()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid week date ranges: start date must be before end date'
      });
    }

    // Check for overlapping weeks
    if ((newConfiguration as any).checkForOverlaps()) {
      return res.status(400).json({
        success: false,
        message: 'Weeks cannot overlap in date ranges'
      });
    }

    const savedConfiguration = await newConfiguration.save();
    await savedConfiguration.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Week configuration created successfully',
      data: savedConfiguration
    });
  } catch (error: any) {
    console.error('Error creating week configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create week configuration',
      error: error.message
    });
  }
};

// Update week configuration
export const updateWeekConfiguration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: IWeekConfigurationUpdate = req.body;
    const userId = (req as any).user?.id || (req as any).gcAgent?._id;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration ID'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Check if configuration exists
    const existingConfig = await WeekConfiguration.findById(id);
    if (!existingConfig) {
      return res.status(404).json({
        success: false,
        message: 'Week configuration not found'
      });
    }

    // If updating year/month, check for conflicts
    if (updateData.year || updateData.month) {
      const year = updateData.year || existingConfig.year;
      const month = updateData.month || existingConfig.month;
      
      const conflictConfig = await WeekConfiguration.findOne({
        _id: { $ne: id },
        year,
        month
      });

      if (conflictConfig) {
        return res.status(409).json({
          success: false,
          message: `Week configuration already exists for ${year}/${month}`
        });
      }
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      await WeekConfiguration.updateMany({ _id: { $ne: id } }, { isDefault: false });
    }

    // Update the configuration
    const updatedConfiguration = await WeekConfiguration.findByIdAndUpdate(
      id,
      {
        ...updateData,
        lastModifiedBy: new Types.ObjectId(userId)
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('lastModifiedBy', 'name email');

    if (!updatedConfiguration) {
      return res.status(404).json({
        success: false,
        message: 'Week configuration not found'
      });
    }

    // Validate updated configuration
    if (!(updatedConfiguration as any).validateWeekRanges()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid week date ranges: start date must be before end date'
      });
    }

    if ((updatedConfiguration as any).checkForOverlaps()) {
      return res.status(400).json({
        success: false,
        message: 'Weeks cannot overlap in date ranges'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Week configuration updated successfully',
      data: updatedConfiguration
    });
  } catch (error: any) {
    console.error('Error updating week configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update week configuration',
      error: error.message
    });
  }
};

// Delete week configuration
export const deleteWeekConfiguration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration ID'
      });
    }

    const configuration = await WeekConfiguration.findById(id);
    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: 'Week configuration not found'
      });
    }

    await WeekConfiguration.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Week configuration deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting week configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete week configuration',
      error: error.message
    });
  }
};

// Toggle week active status
export const toggleWeekStatus = async (req: Request, res: Response) => {
  try {
    const { id, weekNumber } = req.params;
    const { isActive } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration ID'
      });
    }

    const weekNum = parseInt(weekNumber);
    if (isNaN(weekNum) || weekNum < 1 || weekNum > 6) {
      return res.status(400).json({
        success: false,
        message: 'Week number must be between 1 and 6'
      });
    }

    const configuration = await WeekConfiguration.findById(id);
    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: 'Week configuration not found'
      });
    }

    const week = configuration.weeks.find(w => w.weekNumber === weekNum);
    if (!week) {
      return res.status(404).json({
        success: false,
        message: `Week ${weekNum} not found in this configuration`
      });
    }

    week.isActive = isActive;
    await configuration.save();

    res.status(200).json({
      success: true,
      message: `Week ${weekNum} status updated successfully`,
      data: configuration
    });
  } catch (error: any) {
    console.error('Error toggling week status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle week status',
      error: error.message
    });
  }
};

// Get weeks for a specific date range
export const getWeeksInDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate.toString());
    const end = new Date(endDate.toString());

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Find configurations where any week overlaps with the date range
    const configurations = await WeekConfiguration.find({
      'weeks.startDate': { $lte: end },
      'weeks.endDate': { $gte: start }
    }).populate('createdBy', 'name email');

    // Filter and return only the overlapping weeks
    const overlappingWeeks = configurations.map(config => ({
      configuration: {
        _id: config._id,
        year: config.year,
        month: config.month,
        createdBy: config.createdBy
      },
      weeks: config.weeks.filter(week => 
        week.startDate <= end && week.endDate >= start
      )
    }));

    res.status(200).json({
      success: true,
      data: overlappingWeeks
    });
  } catch (error: any) {
    console.error('Error fetching weeks in date range:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weeks in date range',
      error: error.message
    });
  }
};
