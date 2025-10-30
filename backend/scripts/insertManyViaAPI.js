import dotenv from 'dotenv'
import axios from 'axios'
import fs from 'fs'

dotenv.config()

async function insertManyViaAPI() {
  try {
    // Check if backup file exists
    if (!fs.existsSync('manual_products_backup.json')) {
      console.log('No backup file found. Please ensure manual_products_backup.json exists.');
      return;
    }

    // Read backup file
    const backupData = JSON.parse(fs.readFileSync('manual_products_backup.json', 'utf8'));

    if (!backupData.products || backupData.products.length === 0) {
      console.log('No products found in backup file.');
      return;
    }

    // MongoDB Data API configuration
    const appId = process.env.MONGO_APP_ID || '<app-id>'; // Replace with your actual app ID
    const apiKey = process.env.MONGO_API_KEY; // Set this in your .env file
    const dataSource = process.env.MONGO_DATA_SOURCE || 'Cluster0'; // Replace with your cluster name
    const database = process.env.MONGO_DATABASE || 'ecommerce'; // Replace with your database name
    const collection = 'products'; // Collection name

    if (!apiKey) {
      console.error('MONGO_API_KEY environment variable is required');
      return;
    }

    const url = `https://data.mongodb-api.com/app/${appId}/endpoint/data/v1/action/insertMany`;

    const payload = {
      dataSource,
      database,
      collection,
      documents: backupData.products
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'apiKey': apiKey
      }
    });

    console.log(`Successfully inserted ${response.data.insertedIds.length} products via Data API.`);

  } catch (err) {
    console.error('Insert error:', err.response ? err.response.data : err.message);
  }
}

insertManyViaAPI();