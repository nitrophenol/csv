const fs = require('fs');
const csv = require('csv-parser');
const { DateTime } = require('luxon');

// Define functions to calculate time difference and check criteria
function calculateTimeDifference(start, end) {
  const startTime = DateTime.fromFormat(start, 'MM/dd/yyyy hh:mm a');
  const endTime = DateTime.fromFormat(end, 'MM/dd/yyyy hh:mm a');
  return endTime.diff(startTime, 'hours').hours;
}
function isConsecutiveDays(date1, date2) {
  if (!date1 || !date2) {
    return false;
  }
  const day1 = DateTime.fromFormat(date1, 'MM/dd/yyyy');
  const day2 = DateTime.fromFormat(date2, 'MM/dd/yyyy');
  return day2.diff(day1, 'days').days === 1;
}
const employees = {};
const hasConsecutiveDays = [];
const haslongShifts = [];
const haslessThan10Hours = [];
a = 0;
fs.createReadStream('employee_data.csv')
  .pipe(csv())
  .on('data', (row) => {
    const positionId = row['Position ID'];
    const employeeName = row['Employee Name'];
    const date = row['Time Out'];
    const timeOut = row['Time Out'];
    const timeIn = row['Time'];
   // console.log(positionId, employeeName, date, timeOut, timeIn);
    if (employeeName) {
      if (!employees[employeeName]) {
        employees[employeeName] = {
          consecutiveDays: 0,
          previousEntry: null,
          hoursWorked: 0,
        };
      }
      if (employees[employeeName].consecutiveDays >= 7) {
        //console.log(`${employeeName} has worked for 7 consecutive days.`);
        hasConsecutiveDays.push(employeeName);
      }
      if (employees[employeeName].hoursWorked >= 14) {
        //console.log(`${employeeName} has worked for more than 14 hours in a single shift.`);
        haslongShifts.push(employeeName);
      }
      if (date && timeOut && timeIn) {
        //  const currentEntryTimeDiff = calculateTimeDifference(timeIn, timeOut);
        // if (date == employees[employeeName].previousEntry) {
        //   employees[employeeName].hoursWorked = calculateTimeDifference(timeIn, timeOut) + employees[employeeName].hoursWorked;
        // }
        // else {
          employees[employeeName].hoursWorked = calculateTimeDifference(timeIn, timeOut);
     //   }
        if (employees[employeeName].previousEntry != null) {
          const currentEntryTimeDiff = calculateTimeDifference(employees[employeeName].previousEntry, timeIn);
          if (currentEntryTimeDiff < 10 && currentEntryTimeDiff > 1) {
            haslessThan10Hours.push(employeeName);
          }
        }
        if (employees[employeeName].previousEntry == null) {
          employees[employeeName].previousEntry = date;
        } else {
          if (isConsecutiveDays(employees[employeeName].previousEntry, date)) {
            employees[employeeName].consecutiveDays++;
          }
        }
        employees[employeeName].previousEntry = date;
      }
    }
  })
  .on('end', () => {
    // Print the employees who meet the criteria
    console.log(hasConsecutiveDays+ " has worked for 7 consecutive days.");
    console.log("");
    console.log(haslongShifts + " has worked for more than 14 hours in a single shift.");
    console.log("");
    console.log(haslessThan10Hours + " has worked for less than 10 hours between shifts.");

  });

