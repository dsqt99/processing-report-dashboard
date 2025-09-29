const fs = require('fs');
const path = require('path');

// Function to save sheet information to JSON file
function saveSheetInformation(sheetInfo) {
  try {
    const dataDir = path.join(__dirname, '..', 'data');
    const filePath = path.join(dataDir, 'sheet_information.json');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Create log entry with Vietnam timezone (+7)
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // Add 7 hours
    const logEntry = {
      timestamp: vietnamTime.toISOString(),
      sheet_url: sheetInfo.sheet_url,
      sheet_name: sheetInfo.sheet_name,
      action: 'configuration_saved'
    };
    
    // Read existing data or create new array
    let existingData = [];
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        existingData = JSON.parse(fileContent);
      } catch (error) {
        console.error('Error reading existing file:', error);
        existingData = [];
      }
    }
    
    // Add new entry
    existingData.push(logEntry);
    
    // Write to file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
    
    console.log('Sheet information saved successfully to:', filePath);
    console.log('Log entry:', logEntry);
    
    return true;
  } catch (error) {
    console.error('Error saving sheet information:', error);
    return false;
  }
}

// If called directly from command line
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length >= 2) {
    const sheetInfo = {
      sheet_url: args[0],
      sheet_name: args[1]
    };
    saveSheetInformation(sheetInfo);
  } else {
    console.log('Usage: node saveSheetInfo.js <sheet_url> <sheet_name>');
  }
}

module.exports = { saveSheetInformation };