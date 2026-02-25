import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../model/productModel.js'
import connectDb from '../config/db.js'

dotenv.config()

async function removeSeededProducts() {
  try {
    await connectDb();

    // Find and delete AI-generated products (isManual: false)
    const result = await Product.deleteMany({
      isManual: false
    });

    console.log(`Removed ${result.deletedCount} seeded products.`);

  } catch (err) {
    console.error('Removal error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

removeSeededProducts();