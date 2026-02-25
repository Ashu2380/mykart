import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../model/productModel.js'
import connectDb from '../config/db.js'

dotenv.config()

async function run() {
  try {
    await connectDb();
    const total = await Product.countDocuments({});
    const categories = await Product.aggregate([
      { $group: { _id: { category: '$category', subCategory: '$subCategory' }, count: { $sum: 1 } } },
      { $sort: { '_id.category': 1, '_id.subCategory': 1 } }
    ]);
    console.log('Total products:', total);
    categories.forEach(row => {
      console.log(`${row._id.category} -> ${row._id.subCategory}: ${row.count}`)
    })
  } catch (e) {
    console.error(e)
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();






