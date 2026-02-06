const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Order = require("../models/orders");
const mongoose = require("mongoose");

// Import Cloudinary upload middleware
const { upload } = require("../config/cloudinary");

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });
        if (userData) {
            const MatchPassword = await bcrypt.compare(
                password,
                userData.password,
            );
            if (MatchPassword) {
                if (userData.is_admin === false) {
                    res.render("adminLogin", {
                        message: "Your not an admin...!!!",
                    });
                } else {
                    req.session.admin = userData._id;
                    res.redirect("/admin/dashboard");
                }
            } else {
                res.render("adminLogin", {
                    message: "Email or Password is incorrect...!!!",
                });
            }
        } else {
            res.render("adminLogin", {
                message: "Email or Password is incorrect...!!!",
            });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const loadLogin = async (req, res) => {
    try {
        res.render("adminLogin");
    } catch (error) {
        console.log(error.message);
    }
};

const loadDashboard = async (req, res) => {
    try {
        const userCount = await User.find({ is_admin: false }).countDocuments();
        const productCount = await Product.find({}).countDocuments();
        const categoryCount = await Category.find({}).countDocuments();
        let totalEarning = 0;

        const result = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$subTotal" },
                },
            },
        ]);

        if (result.length > 0) {
            totalEarning = result[0].total;
        } else {
            totalEarning = 0;
        }

        const bestProduct = await Order.aggregate([
            { $unwind: "$orderedProducts" },
            {
                $group: {
                    _id: "$orderedProducts.productId",
                    totalCount: { $sum: "$orderedProducts.quantity" }, // Sum the quantities ordered
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            {
                $lookup: {
                    from: "categories",
                    localField: "product.categoryName",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: "$category" },
            {
                $project: {
                    _id: 1,
                    totalCount: 1,
                    "product.name": 1,
                    "category.name": 1,
                    "product.images": 1,
                    "product.quantity": 1,
                },
            },
            { $sort: { totalCount: -1 } },
            { $limit: 5 },
        ]);

        // console.log('best Product',bestProduct);

        let bestCategory = await Order.aggregate([
            { $unwind: "$orderedProducts" },
            {
                $lookup: {
                    from: "products",
                    localField: "orderedProducts.productId", // Correct field
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            {
                $group: {
                    _id: "$product.categoryName", // Correctly reference the product category
                    totalCategoryCount: { $sum: 1 }, // Summing the quantities
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id", // Correct field
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: "$category" },
            { $project: { _id: 1, "category.name": 1, totalCategoryCount: 1 } },
            { $sort: { totalCategoryCount: -1 } }, // Correct field
            { $limit: 5 },
        ]);

        // console.log(bestCategory);

        res.render("adminDashboard", {
            userCount,
            productCount,
            categoryCount,
            totalEarning,
            bestProduct,
            bestCategory,
        });
    } catch (error) {
        console.log(error.message);
    }
};

const logout = async (req, res) => {
    try {
        req.session.destroy();

        return res.redirect("/admin");
    } catch (error) {
        console.log(error.message);
    }
};

const userList = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 0;
        let limit = 5;
        let skip = page * limit;
        const userCount = await User.find({ is_admin: false }).count();
        const userData1 = await User.find({ is_admin: false })
            .skip(skip)
            .limit(limit);
        res.render("userList", { users: userData1, page, userCount });
    } catch (error) {
        console.log(error.message);
    }
};

const loadcategoryList = async (req, res) => {
    try {
        const categoriesData = await Category.find({});
        if (categoriesData) {
            res.render("categoryList", {
                success: "ok",
                categories: categoriesData,
            });
        } else {
            res.render("categoryList", { errmsg: "error" });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const loadaddCategory = async (req, res) => {
    try {
        res.render("addCategory", { success: "ok" });
    } catch (error) {
        console.log(error.message);
    }
};

const addCategory = async (req, res) => {
    try {
        // const name = req.body.name.trim().toUpperCase();
        const category = req.body.category.toUpperCase();
        let changes = true;
        // console.log(req.body.changes);
        const exist = await Category.findOne({ name: category });
        if (exist) {
            res.render("addCategory", {
                errmsg: "Category is already existing",
            });
        } else {
            if (req.body.changes == "unlisted") {
                let changes = false;
            }
            const data = Category({
                name: category,
                is_listed: changes,
            });

            const categoryData = await data.save();

            if (categoryData) {
                const categoriesData = await Category.find({});
                if (categoriesData) {
                    res.redirect("/admin/categoryList");
                } else {
                    res.render("categoryList", { errmsg: "error" });
                }
            } else {
                const categoriesData = await Category.find({});
                if (categoriesData) {
                    res.redirect("/admin/categoryList");
                } else {
                    res.render("categoryList", { errmsg: "error" });
                }
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};

const blockUser = async (req, res) => {
    try {
        const userId = req.query.userId;
        const checking = await User.findOne({ _id: userId });

        if (checking.is_blocked == false) {
            const confirmation = await User.findOneAndUpdate(
                { _id: userId },
                { $set: { is_blocked: true } },
            );
            // req.session.user_id=null
            res.json(confirmation);
        } else {
            const confirmation = await User.findOneAndUpdate(
                { _id: checking._id },
                { $set: { is_blocked: false } },
            );
            res.json(confirmation);
        }
    } catch (error) {
        console.log(error.message);
    }
};

const listCategory = async (req, res) => {
    try {
        const categoryId = req.query.categoryId;

        const checking = await Category.findById({ _id: categoryId });

        if (checking.is_listed == false) {
            const confirmation = await Category.findOneAndUpdate(
                { _id: checking._id },
                { $set: { is_listed: true } },
            );
            res.json(confirmation);
        } else {
            const confirmation = await Category.findOneAndUpdate(
                { _id: checking._id },
                { $set: { is_listed: false } },
            );
            res.json(confirmation);
        }
    } catch (error) {
        console.log(error.message);
    }
};

const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.query.categoryId;

        const checking = await Category.findById({ _id: categoryId });
        if (checking) {
            const confirmation = await Category.deleteOne({ _id: categoryId });
            if (confirmation) {
                res.redirect("/admin/categoryList");
            } else {
                res.status(500).json({
                    error: "Internal server error",
                    message: error.message,
                });
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};

const loadEditCategory = async (req, res) => {
    try {
        const categoryId = req.query.categoryId;
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.redirect("*");
        }

        const errmsg = req.flash("errMsg");
        const categoryName = req.query.categoryName;
        res.render("editCategory", {
            categoryId: categoryId,
            categoryOldName: categoryName,
            errmsg,
        });
    } catch (error) {
        console.log(error.message);
    }
};

const editCategory = async (req, res) => {
    try {
        const categoryId = req.body.categoryId;
        // const categoryOldName = req.body.categoryOldName
        const categoryName = req.body.categoryName.toUpperCase();
        let changes = true;

        if (req.body.changes == "unlisted") {
            changes = false;
        }
        // console.log(req.body.categoryOldName);
        const exist = await Category.findOne({ name: categoryName });

        //checking the category name is existing or not
        if (exist) {
            req.flash("errMsg", "This category is already existing...!!!");
            return res.redirect(`/admin/editCategory?categoryId=${categoryId}`);
        } else {
            const confirmation = await Category.findOneAndUpdate(
                { _id: categoryId },
                { $set: { name: categoryName, is_listed: changes } },
            );
            if (confirmation) {
                res.redirect("/admin/categoryList");
            } else {
                res.status(500).json({
                    error: "Internal server error",
                    message: error.message,
                });
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};

const loadAddProduct = async (req, res) => {
    try {
        const categoryData = await Category.find({ is_listed: true });
        const msg = req.flash("errmsg");
        res.render("addProduct", { categories: categoryData, msg });
    } catch (error) {
        console.log(error.message);
    }
};

// Note: upload middleware is imported from ../config/cloudinary

//add product
const addProduct = async (req, res) => {
    try {
        console.log("req *************", req.body);
        if (req.body.name.trim().toUpperCase() === "") {
            req.flash("errmsg", "Name is required");
            return res.redirect("/admin/addProducts");
        }

        const name = req.body.name.trim().toUpperCase();
        const exist = await Product.findOne({ name: name });

        if (exist) {
            req.flash("errmsg", "This Product is already exist...!!!");
            return res.redirect("/admin/addProducts");
        } else {
            // Use Cloudinary URL (path) instead of local filename
            const images = req.files["images"].map((e) => e.path);
            // if(req.file.size > 4){
            //     req.flash('errmsg', 'You need to insert 4 images');
            //     return res.redirect('/admin/addProducts')
            // }

            const product = new Product({
                name: name,
                price: req.body.price,
                quantity: {
                    small: req.body.small,
                    medium: req.body.medium,
                    large: req.body.large,
                },
                categoryName: req.body.category,
                description: req.body.description,
                images,
                is_listed: true,
            });

            await product.save();

            if (product) {
                res.redirect("/admin/productsList");
            } else {
                res.render("productList", {
                    products: productsData,
                    success: "Cannot add new Product",
                });
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    verifyLogin,
    loadLogin,
    loadDashboard,
    logout,
    userList,
    loadcategoryList,
    loadaddCategory,
    addCategory,
    blockUser,
    listCategory,
    deleteCategory,
    loadEditCategory,
    editCategory,
    loadAddProduct,
    addProduct,
    upload,
};
