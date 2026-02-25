import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../model/productModel.js'
import connectDb from '../config/db.js'

dotenv.config()

async function removeManualProducts() {
  try {
    await connectDb();

    // Find and delete manually added products (isManual: true)
    const result = await Product.deleteMany({
      isManual: true
    });

    console.log(`Removed ${result.deletedCount} manual products.`);

  } catch (err) {
    console.error('Removal error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

removeManualProducts();