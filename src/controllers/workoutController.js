const Category = require("../models/categoryModel");
const Product = require("../models/productModel");

exports.getWorkouts = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            data: []
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server error."
        });
    }
}


exports.getWorkoutsByCategory = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            products: []
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            error: error.message || "Internal Server error."
        });
    }
}

exports.getWorkoutsById = (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            products: []
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server error."
        });
    }
}

exports.addWorkout = async (req, res) => {
    try {
        const { title, description, category, price, stock, images, thumbnail } = req.body;

        res.status(201).json({
            success: true,
            message: "Product updated",
            data: []
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server error."
        });
    }
}


exports.updateWorkout = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, price, stock, images, thumbnail } = req.body;
        
        
        res.status(200).json({
            success: true,
            message: "Product updated",
            data: []
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server error."
        });
    }
}

exports.deleteWorkout = (req, res) => {
    const { id } = req.params;
    
    res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        data: []
    })
}

exports.getCategories = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: []
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }

}