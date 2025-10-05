import mongoose, { Schema, Document } from 'mongoose';
import { IWeekConfiguration, IWeek } from '../types/IWeekConfiguration';

// Week subdocument schema
const WeekSchema = new Schema<IWeek>({
  weekNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, { _id: false });

// Main WeekConfiguration schema
const WeekConfigurationSchema = new Schema<IWeekConfiguration>({
  year: {
    type: Number,
    required: true,
    index: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
    index: true
  },
  weeks: [WeekSchema],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'weekconfigurations'
});

// Compound indexes for efficient querying
WeekConfigurationSchema.index({ year: 1, month: 1 }, { unique: true });
WeekConfigurationSchema.index({ createdBy: 1 });
WeekConfigurationSchema.index({ isDefault: 1 });

// Pre-save validation
WeekConfigurationSchema.pre('save', function(next) {
  const weeks = this.weeks.sort((a, b) => a.weekNumber - b.weekNumber);
  
  // Check for overlaps
  for (let i = 0; i < weeks.length - 1; i++) {
    if (weeks[i].endDate >= weeks[i + 1].startDate) {
      return next(new Error('Weeks cannot overlap'));
    }
  }
  
  // Allow weeks to start/end outside the target month; no coverage requirement
  this.updatedAt = new Date();
  next();
});

// Pre-update middleware to update the updatedAt field
WeekConfigurationSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Virtual for getting the total number of weeks
WeekConfigurationSchema.virtual('totalWeeks').get(function() {
  return this.weeks.length;
});

// Virtual for getting active weeks only
WeekConfigurationSchema.virtual('activeWeeks').get(function() {
  return this.weeks.filter(week => week.isActive);
});

// Method to validate week date ranges
WeekConfigurationSchema.methods.validateWeekRanges = function(): boolean {
  for (const week of this.weeks) {
    if (week.startDate >= week.endDate) {
      return false;
    }
  }
  return true;
};

// Method to check for overlapping weeks
WeekConfigurationSchema.methods.checkForOverlaps = function(): boolean {
  const sortedWeeks = [...this.weeks].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  
  for (let i = 0; i < sortedWeeks.length - 1; i++) {
    if (sortedWeeks[i].endDate >= sortedWeeks[i + 1].startDate) {
      return true; // Overlap found
    }
  }
  return false;
};

// Define static methods interface
interface IWeekConfigurationModel extends mongoose.Model<IWeekConfiguration> {
  findByYearAndMonth(year: number, month: number): Promise<IWeekConfiguration | null>;
  findDefault(): Promise<IWeekConfiguration | null>;
  findActive(): Promise<IWeekConfiguration[]>;
}

// Static method to find configuration by year and month
WeekConfigurationSchema.statics.findByYearAndMonth = function(year: number, month: number) {
  return this.findOne({ year, month });
};

// Static method to find default configuration
WeekConfigurationSchema.statics.findDefault = function() {
  return this.findOne({ isDefault: true });
};

// Static method to find active configurations
WeekConfigurationSchema.statics.findActive = function() {
  return this.find({ 'weeks.isActive': true });
};

const WeekConfiguration = mongoose.model<IWeekConfiguration, IWeekConfigurationModel>('WeekConfiguration', WeekConfigurationSchema);

export default WeekConfiguration;
