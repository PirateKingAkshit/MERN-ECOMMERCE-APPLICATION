const asyncHandler = require("express-async-handler");
const Joi = require("joi");
const Product = require("../models/productModel");

// Joi Schema for product creation
const productSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Name is required",
  }),
  description: Joi.string().required().messages({
    "any.required": "Description is required",
  }),
  price: Joi.number().required().messages({
    "any.required": "Price is required",
  }),
  category: Joi.string().required().messages({
    "any.required": "Category is required",
  }),
  stock: Joi.number().required().messages({
    "any.required": "Stock is required",
  }),
  image: Joi.string(),
  brand: Joi.string(),
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Protected
const createProduct = asyncHandler(async (req, res) => {
  let { error, value } = productSchema.validate(req.body, {
    abortEarly: false,
  }); // It will show all errors at once

  if (error) {
    error = error.details.map((err) => err.message);
    console.log(error);
    return res.status(400).json({ error });
  }

  const { name, description, price, category, stock, image, brand } = value;

    let product = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    image,
    brand,
  })

  product =await Product.findById({_id:product.id}).populate("category")
    
  res.status(201).json(product);
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let products;

  if (search) {
    // If there's a search query
    products = await Product.find({
      name: { $regex: search, $options: "i" }, // Case-insensitive search by name
     
    }).populate("category");
  } else {
    // If no search query, fetch all products
    products = await Product.find().populate("category");
  }

  const count = products.length;
  res.json({ count, products });
});




// @desc    Get a single product by ID
// @route   GET /api/products/id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// @desc   Update a product by id
// @route  PUT /api/products/id
// @access Protected
const updateProduct = asyncHandler(async (req, res) => {
  let { error, value } = productSchema.validate(req.body, {
    abortEarly: false,
  }); // It will show all errors at once

  if (error) {
    error = error.details.map((err) => err.message);
    console.log(error);
    return res.status(400).json({ error });
  }

  const { name, description, price, category, stock, image, brand } = value;

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { name, description, price, category, stock, image, brand },
    { new: true }
  ).populate("category");

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// @desc   Delete a product by id
// @route  PUT /api/products/id
// @access Protected
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (product) {
    res.json({ message: "Product removed" });
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});


// @desc    Search products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.categoryId;

  const products = await Product.find({
    category: categoryId,
  }).populate("category");
    const count = products.length

  if (products) {
    res.json({count,products});
  } else {
    res.status(404).json({ error: 'Products not found for this category' });
  }
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
};