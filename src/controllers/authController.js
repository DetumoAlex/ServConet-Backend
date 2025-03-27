// const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const mailSender = require('../utils/email-utils');

// // Register user
// router.post('/register', async (req, res) => {
//     try {
//         const { name, email, password, role } = req.body;
        
//         let user = await User.findOne({ email });
//         if (user) return res.status(400).json({ message: 'User already exists' });
        
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);
        
//         user = new User({ name, email, password: hashedPassword, role });
//         await user.save();
        
//         const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
//         res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// })

// // Login a user
// router.post('/login', async (req, res) => {
//     try {
//       const { email, password } = req.body;
//       const user = await User.findOne({ email });
//       if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  
//       const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
//       res.json({ token, user });
//     } catch (error) {
//       res.status(500).json({ message: 'Server error' });
//     }
//   });
  
//   // Get user profile (protected route)
//   router.get('/profile', authMiddleware, async (req, res) => {
//     try {
//       const user = await User.findById(req.user.id).select('-password');
//       if (!user) return res.status(404).json({ message: 'User not found' });
//       res.json(user);
//     } catch (error) {
//       res.status(500).json({ message: 'Server error' });
//     }
//   });

//   // Get all users (Admin only)
// router.get('/users', authMiddleware, async (req, res) => {
//   try {
//       if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

//       const users = await User.find().select('-password');
//       res.json(users);
//   } catch (error) {
//       res.status(500).json({ message: 'Error fetching users', error });
//   }
// });

// // Get a single user by ID
// router.get('/users/:id', authMiddleware, async (req, res) => {
//   try {
//       const user = await User.findById(req.params.id).select('-password');
//       if (!user) return res.status(404).json({ message: 'User not found' });

//       res.json(user);
//   } catch (error) {
//       res.status(500).json({ message: 'Error fetching user', error });
//   }
// });

// // Update user details
// router.put('/users/:id', authMiddleware, async (req, res) => {
//   try {
//       const { name, email } = req.body;

//       // Allow users to update only their own data (unless admin)
//       if (req.user.id !== req.params.id && req.user.role !== 'admin') {
//           return res.status(403).json({ message: 'Unauthorized action' });
//       }

//       const user = await User.findByIdAndUpdate(
//           req.params.id,
//           { name, email },
//           { new: true, runValidators: true }
//       ).select('-password');

//       if (!user) return res.status(404).json({ message: 'User not found' });

//       res.json(user);
//   } catch (error) {
//       res.status(500).json({ message: 'Error updating user', error });
//   }
// });

// // Delete a user (Admin only)
// router.delete('/users/:id', authMiddleware, async (req, res) => {
//   try {
//       if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

//       const user = await User.findByIdAndDelete(req.params.id);
//       if (!user) return res.status(404).json({ message: 'User not found' });

//       res.json({ message: 'User deleted successfully' });
//   } catch (error) {
//       res.status(500).json({ message: 'Error deleting user', error });
//   }
// });
  
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/user-model');

// Register user
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        user = new User({ name, email, password: hashedPassword, role });
        await user.save();
        
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        // if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error:error.message });
    }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error });
    }
};

// Update user details
exports.updateUser = async (req, res) => {
    try {
        const { name, email } = req.body;

        // Allow users to update only their own data (unless admin)
        if (req.user.id !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized action' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
};

// Delete a user (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};

 