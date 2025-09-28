// Utility functions for file operations

export interface SheetLogEntry {
  timestamp: string;
  sheet_url: string;
  sheet_name: string;
  action: string;
}

export const saveSheetInformationLog = async (sheetInfo: { sheet_url: string; sheet_name: string }): Promise<void> => {
  try {
    const logEntry: SheetLogEntry = {
      timestamp: new Date().toISOString(),
      sheet_url: sheetInfo.sheet_url,
      sheet_name: sheetInfo.sheet_name,
      action: 'configuration_saved'
    };

    // Save only the latest entry to localStorage (overwrite previous)
    localStorage.setItem('sheet_information_logs', JSON.stringify([logEntry]));

    // Try to save to actual file in data directory (only latest entry)
    try {
      // Call a backend endpoint to save the file
      const response = await fetch('http://localhost:3001/api/save-sheet-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheet_url: sheetInfo.sheet_url,
          sheet_name: sheetInfo.sheet_name,
          allLogs: [logEntry] // Only send the latest entry
        }),
      });

      if (response.ok) {
        console.log('Sheet information saved to data/sheet_information.json successfully');
      } else {
        throw new Error('Failed to save to file');
      }
    } catch (error) {
      console.log('Could not save to file system, data saved to localStorage only');
      
      // Fallback: create downloadable file for manual saving
      const jsonContent = JSON.stringify([logEntry], null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sheet_information.json';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Sheet information file downloaded - please save to data/ directory');
    }

    console.log('Sheet information logged:', logEntry);
    
  } catch (error) {
    console.error('Error saving sheet information:', error);
    throw error;
  }
};

export const getSheetInformationLogs = (): SheetLogEntry[] => {
  try {
    const existingDataStr = localStorage.getItem('sheet_information_logs');
    if (existingDataStr) {
      return JSON.parse(existingDataStr);
    }
    return [];
  } catch (error) {
    console.error('Error reading sheet information logs:', error);
    return [];
  }
};