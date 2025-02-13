const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  deleteUser,
} = require("../controllers/authControllers"); // ✅ Now using CommonJS

const router = express.Router();
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");
const Product = require("../models/Product");

// Routes
router.post("/signup", registerUser);
router.get("/users", authMiddleware, getAllUsers);
router.post("/login", loginUser);
router.delete("/delete/:id", authMiddleware, deleteUser);
// clears token when user logs out
router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
  res.json({ message: "Logged out successfully" });
});

// /api/auth/me - Get the currently authenticated user's data
router.get("/me", authMiddleware, async (req, res) => {
  console.log("message");
  try {
    const user = await User.findById(req.user.id); // Get the user from DB using the decoded token
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/products", async (req, res) => {
  const { category, color, minPrice, maxPrice } = req.query;
  const filter = {};

  // Filter by category (if provided)
  if (category && category !== "all") filter.category = category;

  // Filter by color using regex for partial matching (if provided)
  if (color) {
    filter.colors = { $regex: color, $options: "i" }; // 'i' for case-insensitive matching
  }

  // Filter by price range (if provided)
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  try {
    // Assuming you're using a Product model, replace with your actual model
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single product
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new product
router.post("/products", authMiddleware, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product
router.put("/products/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product
router.delete("/products/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
