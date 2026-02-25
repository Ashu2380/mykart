import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../model/productModel.js'
import connectDb from '../config/db.js'
import fs from 'fs'

dotenv.config()

async function restoreManualProducts() {
  try {
    await connectDb();

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

    // Insert products back into database
    const result = await Product.insertMany(backupData.products, { ordered: false });

    console.log(`Restored ${result.length} manual products from backup.`);

  } catch (err) {
    console.error('Restore error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

restoreManualProducts();