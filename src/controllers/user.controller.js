const User = require('../models/User');


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