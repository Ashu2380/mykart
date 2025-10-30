import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../model/productModel.js'
import connectDb from '../config/db.js'
import fs from 'fs'

dotenv.config()

async function restoreProductsBetween2to4PM() {
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

    // Filter products added between 2 PM and 4 PM IST
    // IST is UTC+5:30, so 2 PM IST = 8:30 AM UTC, 4 PM IST = 10:30 AM UTC
    const startTime = new Date('2025-10-30T08:30:00.000Z'); // 2 PM IST = 8:30 AM UTC
    const endTime = new Date('2025-10-30T10:30:00.000Z');   // 4 PM IST = 10:30 AM UTC

    const filteredProducts = backupData.products.filter(product => {
      const createdAt = new Date(product.createdAt);
      return createdAt >= startTime && createdAt <= endTime;
    });

    if (filteredProducts.length === 0) {
      console.log('No products found that were added between 2 PM and 4 PM IST.');
      return;
    }

    // Insert filtered products back into database
    const result = await Product.insertMany(filteredProducts, { ordered: false });

    console.log(`Restored ${result.length} products that were added between 2 PM and 4 PM IST.`);

  } catch (err) {
    console.error('Restore error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

restoreProductsBetween2to4PM();