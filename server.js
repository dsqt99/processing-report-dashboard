import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Helper function to format time as HH:mm:ss DD/MM/YYYY
const formatDateTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  
  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
};

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint to save sheet information
app.post('/api/save-sheet-info', (req, res) => {
  try {
    const { sheet_url, sheet_name, allLogs } = req.body;
    
    const dataDir = path.join(__dirname, 'data');
    const filePath = path.join(dataDir, 'sheet_information.json');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Write to file
    fs.writeFileSync(filePath, JSON.stringify(allLogs, null, 2), 'utf8');
    
    console.log('Sheet information saved successfully to:', filePath);
    
    res.json({ 
      success: true, 
      message: 'Sheet information saved successfully',
      filePath: filePath
    });
    
  } catch (error) {
    console.error('Error saving sheet information:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save sheet information',
      error: error.message 
    });
  }
});

// API endpoint to get sheet configuration
app.get('/api/sheet-config', (req, res) => {
  try {
    const dataDir = path.join(__dirname, 'data');
    const filePath = path.join(dataDir, 'sheet_information.json');
    
    if (!fs.existsSync(filePath)) {
      return res.json({ 
        success: false, 
        message: 'No sheet configuration found',
        config: null
      });
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const sheetInfo = JSON.parse(data);
    
    // Get the latest configuration (last item in array)
    const latestConfig = sheetInfo[sheetInfo.length - 1];
    
    if (!latestConfig) {
      return res.json({ 
        success: false, 
        message: 'No configuration data found',
        config: null
      });
    }
    
    res.json({ 
      success: true, 
      config: {
        sheet_url: latestConfig.sheet_url,
        sheet_name: latestConfig.sheet_name
      }
    });
    
  } catch (error) {
    console.error('Error reading sheet configuration:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to read sheet configuration',
      error: error.message 
    });
  }
});

// API endpoint to fetch sheet data from webhook and save to tiendocongviec.json
app.post('/api/fetch-and-save-sheet-data', async (req, res) => {
  try {
    const { sheet_url, sheet_name } = req.body;
    
    // Call the webhook API to get sheet data with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const webhookResponse = await fetch('https://n8n-hungyen.cahy.io.vn/webhook/check-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sheet_url: sheet_url,
        sheet_name: sheet_name
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    console.log('Webhook response status:', webhookResponse.status);
    console.log('Webhook response headers:', Object.fromEntries(webhookResponse.headers.entries()));
    
    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.log('Webhook error response body:', errorText);
      throw new Error(`Webhook API returned ${webhookResponse.status}: ${webhookResponse.statusText}. Body: ${errorText}`);
    }

    const sheetData = await webhookResponse.json();
    
    const dataDir = path.join(__dirname, 'data');
    const filePath = path.join(dataDir, 'tiendocongviec.json');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Create new JSON structure with save_time and data
    const jsonStructure = {
      save_time: formatDateTime(),
      data: sheetData
    };
    
    // Write to file
    fs.writeFileSync(filePath, JSON.stringify(jsonStructure, null, 2), 'utf8');
    
    console.log('Sheet data fetched and saved successfully to:', filePath);
    
    res.json({ 
      success: true, 
      message: 'Sheet data fetched and saved successfully',
      filePath: filePath,
      dataCount: Array.isArray(sheetData) ? sheetData.length : 0
    });
    
  } catch (error) {
    console.log('Error fetching and saving sheet data:', error);
    console.log('Error details:', {
      name: error.name,
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });
    
    let errorMessage = error.message;
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - webhook took too long to respond';
    } else if (error.cause?.code === 'UND_ERR_CONNECT_TIMEOUT') {
      errorMessage = 'Connection timeout - unable to connect to webhook server';
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching and saving sheet data',
      error: errorMessage,
      details: {
        errorType: error.name,
        originalError: error.message
      }
    });
  }
});

// API endpoint to save sheet data
app.post('/api/save-sheet-data', (req, res) => {
  try {
    const { sheetData } = req.body;
    
    const dataDir = path.join(__dirname, 'data');
    const filePath = path.join(dataDir, 'sheet_data.json');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Write to file
    fs.writeFileSync(filePath, JSON.stringify(sheetData, null, 2), 'utf8');
    
    console.log('Sheet data saved successfully to:', filePath);
    
    res.json({ 
      success: true, 
      message: 'Sheet data saved successfully',
      filePath: filePath
    });
    
  } catch (error) {
    console.error('Error saving sheet data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving sheet data',
      error: error.message 
    });
  }
});

// API endpoint to refresh data from webhook
app.post('/api/refresh-data', async (req, res) => {
  try {
    const webhookUrl = 'https://n8n-hungyen.cahy.io.vn/webhook/check-connection';
    const requestData = {
      sheet_url: "https://docs.google.com/spreadsheets/d/1sb6lnE9yMY6Nj9H2L2clHGhX05bHXvB_1SQXuWBPsrU/edit?usp=sharing",
      sheet_name: "Trang tính1"
    };

    console.log('Fetching data from webhook:', webhookUrl);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received data from webhook:', data);

    // Save to tiendocongviec.json with new structure
    const dataDir = path.join(__dirname, 'data');
    const filePath = path.join(dataDir, 'tiendocongviec.json');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create new JSON structure with save_time and data
    const jsonStructure = {
      save_time: formatDateTime(),
      data: data
    };

    // Write to file
    fs.writeFileSync(filePath, JSON.stringify(jsonStructure, null, 2), 'utf8');
    
    console.log('Data refreshed and saved to:', filePath);
    
    res.json({ 
      success: true, 
      message: 'Data refreshed successfully',
      data: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error refreshing data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error refreshing data',
      error: error.message 
    });
  }
});

// API endpoint to get tasks data from tiendocongviec.json
app.get('/api/tasks', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'data', 'tiendocongviec.json');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.json({ 
        success: true, 
        data: [],
        message: 'No data file found, returning empty array'
      });
    }
    
    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    
    // Handle new JSON structure with save_time and data properties
    let tasksData;
    let saveTime;
    
    if (jsonData.data && Array.isArray(jsonData.data)) {
      // New structure: { save_time: "...", data: [...] }
      tasksData = jsonData.data;
      saveTime = jsonData.save_time;
    } else if (Array.isArray(jsonData)) {
      // Old structure: [...]
      tasksData = jsonData;
      saveTime = null;
    } else {
      throw new Error('Invalid JSON structure');
    }
    
    console.log(`Tasks data loaded: ${tasksData.length} records, save_time: ${saveTime}`);
    
    res.json({ 
      success: true, 
      data: tasksData,
      count: tasksData.length,
      save_time: saveTime
    });
    
  } catch (error) {
    console.error('Error reading tasks data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error reading tasks data',
      error: error.message,
      data: []
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`File server running on http://0.0.0.0:${PORT}`);
  console.log(`Access from external: http://113.160.207.71:${PORT}`);
});

export default app;