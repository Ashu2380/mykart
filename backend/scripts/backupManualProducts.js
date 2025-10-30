import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../model/productModel.js'
import connectDb from '../config/db.js'
import fs from 'fs'

dotenv.config()

async function backupManualProducts() {
  try {
    await connectDb();

    // Find all products (since we want to backup everything before clearing)
    const manualProducts = await Product.find({});

    if (manualProducts.length === 0) {
      console.log('No manual products found to backup.');
      return;
    }

    // Save to JSON file
    const backupData = {
      timestamp: new Date().toISOString(),
      count: manualProducts.length,
      products: manualProducts
    };

    fs.writeFileSync('manual_products_backup.json', JSON.stringify(backupData, null, 2));
    console.log(`Backed up ${manualProducts.length} manual products to manual_products_backup.json`);

  } catch (err) {
    console.error('Backup error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

backupManualProducts();