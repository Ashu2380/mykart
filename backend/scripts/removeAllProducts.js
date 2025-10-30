import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../model/productModel.js'
import connectDb from '../config/db.js'

dotenv.config()

async function removeAllProducts() {
  try {
    await connectDb();

    // Delete all products
    const result = await Product.deleteMany({});

    console.log(`Removed ${result.deletedCount} products.`);

  } catch (err) {
    console.error('Removal error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

removeAllProducts();