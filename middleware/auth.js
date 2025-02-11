const express = require("express");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Changed to arrow function
  // const token = req.headers["authorization"] || req.headers["Authorization"]; // Ensure this is correct
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware; // Exporting as default
