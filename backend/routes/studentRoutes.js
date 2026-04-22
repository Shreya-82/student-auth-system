const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, course } = req.body;

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      name,
      email,
      password: hashedPassword,
      course
    });

    await student.save();

    res.status(201).json({ message: "Student registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        course: student.course
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Protected Dashboard
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.studentId).select("-password");
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update Password
router.put("/update-password", authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const student = await Student.findById(req.studentId);

    const isMatch = await bcrypt.compare(oldPassword, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    student.password = hashedPassword;

    await student.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update Course
router.put("/update-course", authMiddleware, async (req, res) => {
  try {
    const { course } = req.body;

    const student = await Student.findById(req.studentId);
    student.course = course;

    await student.save();

    res.status(200).json({ message: "Course updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;