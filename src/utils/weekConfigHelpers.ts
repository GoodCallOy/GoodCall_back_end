import { IWeek, IWeekConfiguration } from '../types/IWeekConfiguration';

// Generate default week configuration (Monday-Sunday)
export async function generateDefaultWeekConfig(year: number, month: number): Promise<Partial<IWeekConfiguration>> {
  const weeks: IWeek[] = [];
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  
  let currentDate = new Date(monthStart);
  let weekNumber = 1;
  
  while (currentDate <= monthEnd) {
    // Find Monday of current week
    const dayOfWeek = currentDate.getDay();
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    
    // Find Sunday of current week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    // Adjust to month boundaries
    const weekStart = monday < monthStart ? monthStart : monday;
    const weekEnd = sunday > monthEnd ? monthEnd : sunday;
    
    weeks.push({
      weekNumber,
      startDate: weekStart,
      endDate: weekEnd,
      isActive: true
    });
    
    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
    weekNumber++;
  }
  
  return {
    year,
    month,
    weeks,
    isDefault: true
  };
}

// Validate week configuration
export function validateWeeks(weeks: any[], year: number, month: number): string[] {
  const errors: string[] = [];
  
  if (!Array.isArray(weeks) || weeks.length === 0) {
    errors.push('At least one week must be defined');
    return errors;
  }
  
  // Check for empty dates
  weeks.forEach((week, index) => {
    if (!week.startDate || !week.endDate) {
      errors.push(`Week ${week.weekNumber}: Both start and end dates are required`);
    }
  });
  
  // Check for overlaps
  const sortedWeeks = [...weeks].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  for (let i = 0; i < sortedWeeks.length - 1; i++) {
    const currentEnd = new Date(sortedWeeks[i].endDate);
    const nextStart = new Date(sortedWeeks[i + 1].startDate);
    
    if (currentEnd >= nextStart) {
      errors.push(`Week ${sortedWeeks[i].weekNumber} and Week ${sortedWeeks[i + 1].weekNumber} overlap`);
    }
  }
  
  // No requirement to cover the entire month; allow spanning outside the month
  
  // Check week numbers are sequential
  for (let i = 0; i < weeks.length; i++) {
    if (weeks[i].weekNumber !== i + 1) {
      errors.push(`Week numbers must be sequential starting from 1`);
      break;
    }
  }
  
  return errors;
}
