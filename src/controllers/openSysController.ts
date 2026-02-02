import { Request, Response } from 'express';
import OpenSys from '../models/openSys';

// Map incoming frontend field names to model field names
const fieldMapping: { [key: string]: string } = {
  'PhoneNumber': 'phoneNumber',
  'BusinessID': 'businessId',
  'Company': 'company',
  'FirstName': 'firstName',
  'LastName': 'lastName',
  'Address': 'address',
  'City': 'city',
  'Email': 'email',
  'Website': 'website',
  'Used': 'used',
  'Result': 'result',
  'ResultDate': 'resultDate',
  'Comments': 'comments',
  'Title': 'title',
  'Industry': 'industry',
  'StaffClass': 'staffClass',
  'RevenueClass': 'revenueClass',
  'PostalCode': 'postalCode',
  'MobileNumber': 'mobileNumber',
  'ImportMessage': 'importMessage',
  'CompanyLanguage': 'companyLanguage',
};

// Helper function to parse date strings
function parseDate(value: any): Date | string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    // Try to parse various date formats
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  // If it's a number (Excel date serial number)
  if (typeof value === 'number') {
    // Excel dates start from 1900-01-01
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 86400000);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return String(value); // Return as string if can't parse
}

// Get all OpenSys records
export const getAllOpenSys = async (_req: Request, res: Response) => {
  try {
    const records = await OpenSys.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (err) {
    console.error('Error fetching OpenSys records:', err);
    res.status(500).json({ message: 'Failed to fetch records', error: err });
  }
};

// Get a single OpenSys record by ID
export const getOpenSysById = async (req: Request, res: Response) => {
  try {
    const record = await OpenSys.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.status(200).json(record);
  } catch (err) {
    console.error('Error fetching OpenSys record:', err);
    res.status(500).json({ message: 'Failed to fetch record', error: err });
  }
};

// Import data from frontend (batch import)
export const importData = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'No data provided or data array is empty' });
    }

    if (data.length > 100) {
      return res.status(400).json({ message: 'Maximum 100 records per batch allowed' });
    }

    // Transform data: map frontend field names to model field names
    const transformedData = data.map((row: any) => {
      const mappedRow: any = {};
      
      // Map each field from frontend format to model format
      Object.keys(fieldMapping).forEach((frontendField) => {
        const modelField = fieldMapping[frontendField];
        if (row[frontendField] !== undefined && row[frontendField] !== null && row[frontendField] !== '') {
          // Handle date fields (only ResultDate is a date)
          if (modelField === 'resultDate') {
            mappedRow[modelField] = parseDate(row[frontendField]);
          } else {
            mappedRow[modelField] = String(row[frontendField]).trim();
          }
        }
      });
      
      return mappedRow;
    });

    // Insert records into database
    const insertedRecords = await OpenSys.insertMany(transformedData, { ordered: false });

    res.status(201).json({
      message: 'Data imported successfully',
      recordsImported: insertedRecords.length,
      totalRows: data.length,
    });
  } catch (err: any) {
    console.error('Error importing data:', err);
    
    // Handle bulk write errors
    if (err.code === 11000 || err.name === 'BulkWriteError') {
      const inserted = err.result?.insertedCount || 0;
      return res.status(207).json({
        message: 'Partial import completed',
        recordsImported: inserted,
        errors: err.writeErrors?.length || 0,
      });
    }

    res.status(500).json({
      message: 'Failed to import data',
      error: err.message || err,
    });
  }
};

// Create a single OpenSys record
export const createOpenSys = async (req: Request, res: Response) => {
  try {
    const newRecord = new OpenSys(req.body);
    const savedRecord = await newRecord.save();
    res.status(201).json({ message: 'Record created', record: savedRecord });
  } catch (err) {
    console.error('Error creating OpenSys record:', err);
    res.status(400).json({ message: 'Failed to create record', error: err });
  }
};

// Update an OpenSys record
export const updateOpenSys = async (req: Request, res: Response) => {
  try {
    const updatedRecord = await OpenSys.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.status(200).json({ message: 'Record updated', record: updatedRecord });
  } catch (err) {
    console.error('Error updating OpenSys record:', err);
    res.status(400).json({ message: 'Failed to update record', error: err });
  }
};

// Delete an OpenSys record
export const deleteOpenSys = async (req: Request, res: Response) => {
  try {
    const deletedRecord = await OpenSys.findByIdAndDelete(req.params.id);
    if (!deletedRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.status(200).json({ message: 'Record deleted', record: deletedRecord });
  } catch (err) {
    console.error('Error deleting OpenSys record:', err);
    res.status(500).json({ message: 'Failed to delete record', error: err });
  }
};

// Delete all OpenSys records
export const deleteAllOpenSys = async (_req: Request, res: Response) => {
  try {
    const result = await OpenSys.deleteMany({});
    res.status(200).json({
      message: 'All records deleted',
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error('Error deleting all OpenSys records:', err);
    res.status(500).json({ message: 'Failed to delete records', error: err });
  }
};

