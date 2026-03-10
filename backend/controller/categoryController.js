import categoryModel from "../model/categoryModel.js";

// Initialize default categories if none exist
const initializeCategories = async () => {
  const count = await categoryModel.countDocuments();
  if (count === 0) {
    const defaultCategories = [
      { name: 'Clothes', subcategories: ['TopWear', 'BottomWear', 'WinterWear', 'InnerWear', 'Socks'] },
      { name: 'Electronics', subcategories: ['Phones', 'Laptops', 'Tablets', 'Accessories', 'Audio'] },
      { name: 'Home & Kitchen', subcategories: ['Furniture', 'Cookware', 'Storage', 'Decor', 'Bedding'] },
      { name: 'Beauty & Health', subcategories: ['Skincare', 'Haircare', 'Makeup', 'Fragrance', 'Wellness'] },
      { name: 'Sports & Outdoors', subcategories: ['Athletic Wear', 'Camping Gear', 'Fitness Equipment', 'Sports Accessories'] },
      { name: 'Books & Media', subcategories: ['Fiction', 'Non-Fiction', 'Educational', 'Comics', 'Movies & TV'] },
      { name: 'Toys & Games', subcategories: ['Action Figures', 'Puzzles', 'Board Games', 'Educational Toys', 'Outdoor Toys'] }
    ];
    await categoryModel.insertMany(defaultCategories);
    console.log("Default categories initialized");
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    await initializeCategories();
    const categories = await categoryModel.find().sort({ createdAt: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    
    const existingCategory = await categoryModel.findOne({ name: name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new categoryModel({
      name,
      subcategories: subcategories || []
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    const category = await categoryModel.findByIdAndUpdate(
      req.params.id,
      { name, subcategories },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Failed to update category" });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const category = await categoryModel.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};

// Add subcategory to category
const addSubcategory = async (req, res) => {
  try {
    const { subcategory } = req.body;
    const category = await categoryModel.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.subcategories.includes(subcategory)) {
      return res.status(400).json({ message: "Subcategory already exists" });
    }

    category.subcategories.push(subcategory);
    await category.save();
    res.status(200).json(category);
  } catch (error) {
    console.error("Error adding subcategory:", error);
    res.status(500).json({ message: "Failed to add subcategory" });
  }
};

// Remove subcategory from category
const removeSubcategory = async (req, res) => {
  try {
    const { subcategory } = req.body;
    const category = await categoryModel.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.subcategories = category.subcategories.filter(s => s !== subcategory);
    await category.save();
    res.status(200).json(category);
  } catch (error) {
    console.error("Error removing subcategory:", error);
    res.status(500).json({ message: "Failed to remove subcategory" });
  }
};

export {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  removeSubcategory,
  initializeCategories
};
