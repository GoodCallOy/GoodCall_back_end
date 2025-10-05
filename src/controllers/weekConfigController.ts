import { Request, Response } from 'express';
import WeekConfiguration from '../models/weekConfiguration';
import { generateDefaultWeekConfig, validateWeeks } from '../utils/weekConfigHelpers';
import { Types } from 'mongoose';

// GET /api/v1/week-config?year=YYYY&month=MM (fallback to current month)
export const getWeekConfigBase = async (req: Request, res: Response) => {
  try {
    console.log('🔵 [week-config][GET /] incoming', {
      url: req.originalUrl,
      query: req.query,
      headersOrigin: req.headers.origin,
      hasCookie: Boolean(req.headers.cookie),
    });
    const now = new Date();
    const yearNum = req.query.year ? parseInt(String(req.query.year)) : now.getFullYear();
    const monthNum = req.query.month ? parseInt(String(req.query.month)) : (now.getMonth() + 1);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      console.warn('🟠 [week-config][GET /] invalid params', { yearNum, monthNum });
      return res.status(400).json({ error: 'Invalid or missing year/month' });
    }

    console.log('🔍 [week-config][GET /] lookup', { yearNum, monthNum });
    let config = await WeekConfiguration.findOne({ year: yearNum, month: monthNum });
    if (!config) {
      console.log('ℹ️ [week-config][GET /] no custom config, generating default');
      const defaultConfig = await generateDefaultWeekConfig(yearNum, monthNum);
      return res.json(defaultConfig);
    }
    console.log('✅ [week-config][GET /] found custom config', { id: (config as any)?._id });
    return res.json(config);
  } catch (error: any) {
    console.error('❌ [week-config][GET /] error fetching base week configuration:', error?.message || error);
    return res.status(500).json({ error: 'Failed to fetch week configuration' });
  }
};

// GET /api/v1/week-config/:year/:month - Get week configuration for a specific month
export const getWeekConfigByYearMonth = async (req: Request, res: Response) => {
  try {
    console.log('🔵 [week-config][GET /:year/:month] incoming', {
      params: req.params,
      headersOrigin: req.headers.origin,
      hasCookie: Boolean(req.headers.cookie),
    });
    const { year, month } = req.params;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum)) {
      console.warn('🟠 [week-config][GET /:year/:month] invalid params', { year, month });
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: 'Month must be between 1 and 12' });
    }

    console.log('🔍 [week-config][GET /:year/:month] lookup', { yearNum, monthNum });
    let config = await WeekConfiguration.findOne({ 
      year: yearNum, 
      month: monthNum 
    });
    
    // If no custom config exists, return default week structure
    if (!config) {
      console.log('ℹ️ [week-config][GET /:year/:month] no custom config, generating default');
      const defaultConfig = await generateDefaultWeekConfig(yearNum, monthNum);
      return res.json(defaultConfig);
    }
    console.log('✅ [week-config][GET /:year/:month] found custom config', { id: (config as any)?._id });
    res.json(config);
  } catch (error: any) {
    console.error('❌ [week-config][GET /:year/:month] error fetching week configuration:', error?.message || error);
    res.status(500).json({ error: 'Failed to fetch week configuration' });
  }
};

// POST /api/v1/week-config - Create or update week configuration
export const createOrUpdateWeekConfig = async (req: Request, res: Response) => {
  try {
    console.log('🔵 [week-config][POST /] incoming', {
      url: req.originalUrl,
      headersOrigin: req.headers.origin,
      hasCookie: Boolean(req.headers.cookie),
      body: req.body,
    });
    const { year, month, weeks, isDefault } = req.body;
    const userId = (req as any).user?.id || (req as any).gcAgent?._id;
    console.log('🔎 [week-config][POST /] derived userId', { userId });
    
    if (!userId) {
      console.warn('🟠 [week-config][POST /] missing userId');
      return res.status(401).json({ error: 'User authentication required' });
    }
    
    // Validate input
    if (!year || !month || !weeks || !Array.isArray(weeks)) {
      console.warn('🟠 [week-config][POST /] invalid input', { year, month, weeksType: typeof weeks });
      return res.status(400).json({ error: 'Invalid input data' });
    }
    
    // Validate weeks
    const validationErrors = validateWeeks(weeks, year, month);
    if (validationErrors.length > 0) {
      console.warn('🟠 [week-config][POST /] validation failed', { validationErrors });
      return res.status(400).json({ errors: validationErrors });
    }
    
    // Check if configuration already exists
    console.log('🔍 [week-config][POST /] check existing', { year, month });
    let config = await WeekConfiguration.findOne({ year, month });
    
    if (config) {
      console.log('✏️  [week-config][POST /] updating existing', { id: (config as any)?._id });
      // Update existing configuration
      config.weeks = weeks;
      config.lastModifiedBy = new Types.ObjectId(userId);
      config.isDefault = isDefault || false;
      config.updatedAt = new Date();
      await config.save();
    } else {
      console.log('🆕 [week-config][POST /] creating new');
      // Create new configuration
      config = new WeekConfiguration({
        year,
        month,
        weeks,
        createdBy: new Types.ObjectId(userId),
        lastModifiedBy: new Types.ObjectId(userId),
        isDefault: isDefault || false
      });
      await config.save();
    }
    
    console.log('✅ [week-config][POST /] saved', { id: (config as any)?._id });
    res.json(config);
  } catch (error: any) {
    console.error('❌ [week-config][POST /] error saving week configuration:', error?.message || error);
    if (error.message === 'Weeks cannot overlap') {
      return res.status(400).json({ error: 'Weeks cannot overlap' });
    }
    // Coverage requirement removed
    res.status(500).json({ error: 'Failed to save week configuration' });
  }
};

// DELETE /api/v1/week-config/:year/:month - Delete week configuration
export const deleteWeekConfig = async (req: Request, res: Response) => {
  try {
    console.log('🔵 [week-config][DELETE /:year/:month] incoming', { params: req.params });
    const { year, month } = req.params;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum)) {
      console.warn('🟠 [week-config][DELETE] invalid params', { year, month });
      return res.status(400).json({ error: 'Invalid year or month' });
    }
    
    const config = await WeekConfiguration.findOneAndDelete({ 
      year: yearNum, 
      month: monthNum 
    });
    
    if (!config) {
      console.warn('🟠 [week-config][DELETE] not found', { yearNum, monthNum });
      return res.status(404).json({ error: 'Week configuration not found' });
    }
    
    console.log('✅ [week-config][DELETE] deleted', { id: (config as any)?._id });
    res.json({ message: 'Week configuration deleted successfully' });
  } catch (error: any) {
    console.error('❌ [week-config][DELETE] error deleting week configuration:', error?.message || error);
    res.status(500).json({ error: 'Failed to delete week configuration' });
  }
};

// GET /api/v1/week-config/year/:year - Get all configurations for a year
export const getWeekConfigsByYear = async (req: Request, res: Response) => {
  try {
    console.log('🔵 [week-config][GET /year/:year] incoming', { params: req.params });
    const { year } = req.params;
    const yearNum = parseInt(year);

    if (isNaN(yearNum)) {
      return res.status(400).json({ error: 'Invalid year' });
    }
    
    console.log('🔍 [week-config][GET /year/:year] listing', { yearNum });
    const configs = await WeekConfiguration.find({ 
      year: yearNum 
    }).sort({ month: 1 });
    
    console.log('✅ [week-config][GET /year/:year] found', { count: configs.length });
    res.json(configs);
  } catch (error: any) {
    console.error('❌ [week-config][GET /year/:year] error fetching year configurations:', error?.message || error);
    res.status(500).json({ error: 'Failed to fetch year configurations' });
  }
};
