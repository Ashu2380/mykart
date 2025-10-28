import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from '../model/productModel.js'
import connectDb from '../config/db.js'

dotenv.config()

const CATEGORIES = {
  'Clothes': ['Men', 'Women', 'Kids'],
  'Electronics': ['Phones', 'Laptops', 'Accessories'],
  'Home & Kitchen': ['Furniture', 'Cookware', 'Storage'],
  'Beauty & Health': ['Skincare', 'Haircare', 'Wellness'],
  'Sports & Outdoors': ['Athletic Wear', 'Camping Gear', 'Fitness Equipment'],
  'Books & Media': ['Fiction', 'Non-Fiction', 'Movies & TV'],
  'Toys & Games': ['Action Figures', 'Board Games', 'Puzzles']
}

const BRANDS = {
  'Clothes': ['RedTape', 'Puma', 'Adidas', 'Nike', 'Levi\'s', 'H&M', 'Zara'],
  'Electronics': ['Samsung', 'Apple', 'Xiaomi', 'Sony', 'Dell', 'HP', 'OnePlus'],
  'Home & Kitchen': ['Ikea', 'Prestige', 'Pigeon', 'Tupperware', 'Philips', 'Butterfly'],
  'Beauty & Health': ['Dove', 'Nivea', 'L\'Oreal', 'Himalaya', 'Mamaearth', 'Neutrogena'],
  'Sports & Outdoors': ['Decathlon', 'Puma', 'Nike', 'Reebok', 'ASICS', 'Yonex'],
  'Books & Media': ['Penguin', 'HarperCollins', 'Hachette', 'Macmillan', 'Random House'],
  'Toys & Games': ['LEGO', 'Mattel', 'Hasbro', 'Nerf', 'Fisher-Price']
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPriceForCategory(category) {
  switch (category) {
    case 'Clothes':
      return randomInt(299, 4999);
    case 'Electronics':
      return randomInt(999, 149999);
    case 'Home & Kitchen':
      return randomInt(199, 29999);
    case 'Beauty & Health':
      return randomInt(99, 9999);
    case 'Sports & Outdoors':
      return randomInt(299, 49999);
    case 'Books & Media':
      return randomInt(99, 2999);
    case 'Toys & Games':
      return randomInt(149, 9999);
    default:
      return randomInt(99, 9999);
  }
}

function sizesForCategory(category) {
  if (category === 'Clothes') {
    return ['S', 'M', 'L', 'XL', 'XXL'];
  }
  return [];
}

function keywordForImage(category, subCategory) {
  switch (category) {
    case 'Clothes':
      return `${subCategory} clothing apparel fashion`;
    case 'Electronics':
      return `${subCategory} electronics gadget`;
    case 'Home & Kitchen':
      return `${subCategory} home kitchen`;
    case 'Beauty & Health':
      return `${subCategory} beauty health skincare`;
    case 'Sports & Outdoors':
      return `${subCategory} sports outdoor`;
    case 'Books & Media':
      return `${subCategory} books media`;
    case 'Toys & Games':
      return `${subCategory} toys games`;
    default:
      return `${category} ${subCategory}`;
  }
}

function tagsFromName(name, category, subCategory) {
  const baseTags = [category, subCategory];
  const nameTags = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3);
  return [...baseTags, ...nameTags].map(t => t.toLowerCase());
}

function placeholderImages(category, subCategory, brand, idx, name) {
  // Use loremflickr with multiple tags to bias images towards product context
  const tags = tagsFromName(name, category, subCategory).join(',');
  const base = `https://loremflickr.com/800/800/${encodeURIComponent(tags)}`;
  // lock param ensures deterministic image per product
  return [
    `${base}?lock=${idx}`,
    `${base}?lock=${idx + 111}`,
    `${base}?lock=${idx + 222}`,
    `${base}?lock=${idx + 333}`
  ];
}

function buildProductName(category, subCategory, brand) {
  switch (category) {
    case 'Clothes': {
      const mapping = {
        Men: `${brand} Men\'s ${subCategory === 'Topwear' ? 'Shirt' : subCategory === 'Bottomwear' ? 'Jeans' : 'Jacket'}`,
        Women: `${brand} Women\'s ${subCategory === 'Topwear' ? 'Top' : subCategory === 'Bottomwear' ? 'Jeans' : 'Sweater'}`,
        Kids: `${brand} Kids ${subCategory === 'Topwear' ? 'T-Shirt' : subCategory === 'Bottomwear' ? 'Pants' : 'Hoodie'}`
      }
      return mapping[subCategory] || `${brand} ${subCategory}`;
    }
    case 'Electronics':
      return `${brand} ${subCategory === 'Phones' ? 'Smartphone' : subCategory === 'Laptops' ? 'Laptop' : 'Accessory'}`;
    case 'Home & Kitchen':
      return `${brand} ${subCategory}`;
    case 'Beauty & Health':
      return `${brand} ${subCategory}`;
    case 'Sports & Outdoors':
      return `${brand} ${subCategory}`;
    case 'Books & Media':
      return `${brand} ${subCategory}`;
    case 'Toys & Games':
      return `${brand} ${subCategory}`;
    default:
      return `${brand} ${subCategory}`;
  }
}

function makeDescription(category, subCategory, brand) {
  return `${brand} ${subCategory} in ${category}. Quality checked, durable, and designed for everyday use.`;
}

async function generateProducts(perCategoryCount = 100) {
  const docs = [];
  Object.entries(CATEGORIES).forEach(([category, subs]) => {
    subs.forEach((sub) => {
      const perSubCount = Math.ceil(perCategoryCount / subs.length);
      for (let i = 1; i <= perSubCount; i++) {
        const brand = (BRANDS[category] || ['Generic'])[(i - 1) % (BRANDS[category]?.length || 1)];
        const name = buildProductName(category, sub, brand);
        const [image1, image2, image3, image4] = placeholderImages(category, sub, brand, i, name);
        const price = randomPriceForCategory(category);
        const sizes = sizesForCategory(category);
        const bestseller = Math.random() < 0.15; // 15% bestsellers
        const description = makeDescription(category, sub, brand);

        docs.push({
          name,
          description,
          price,
          category,
          subCategory: sub,
          sizes,
          bestseller,
          date: Date.now(),
          image1,
          image2,
          image3,
          image4
        });
      }
    })
  })
  return docs;
}

async function run() {
  try {
    await connectDb();
    const perCategory = Number(process.argv[2]) || 100;
    const products = await generateProducts(perCategory);

    // Optional: Clear existing products first if flag provided
    const shouldClear = process.argv.includes('--clear');
    if (shouldClear) {
      await Product.deleteMany({});
      console.log('Cleared existing products');
    }

    const result = await Product.insertMany(products, { ordered: false });
    console.log(`Inserted ${result.length} products.`);
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();


