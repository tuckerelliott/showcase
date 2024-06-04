/* Helper Functions */

function excelDateToJSDate(serial) {
  const excelEpoch = new Date(1899, 11, 30); // Excel's epoch date (December 30, 1899)
  const jsDate = new Date(excelEpoch.getTime() + serial * 86400000); // 86400000 ms per day
  return jsDate;
}

export function formatDate(dateStr) {
  let date;
  
  // Check if the string can be parsed as a number (Excel serial date)
  if (!isNaN(dateStr)) {
      const serial = parseInt(dateStr, 10);
      date = excelDateToJSDate(serial);
  } else {
      // Otherwise, assume it's a standard date string and parse it
      date = new Date(dateStr);
  }

  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
}