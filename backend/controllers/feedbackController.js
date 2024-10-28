const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
    try {
        const feedback = new Feedback(req.body);
        await feedback.save();
        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: feedback
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: feedback
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateFeedbackStatus = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.status(200).json({
            success: true,
            data: feedback
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};