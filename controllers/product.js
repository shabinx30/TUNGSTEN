const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const ProductOffer = require("../models/ProductOffers");
const mongoose = require("mongoose");
const CategoryOffer = require("../models/categoryOffer");
const Cart = require("../models/cartModel");
const Wishlist = require("../models/wishlistModel");

// Import Cloudinary upload middleware
const { upload } = require("../config/cloudinary");

//rendering the shop page
const shop = async (req, res) => {
    try {
        let productData = await Product.find({ is_listed: true });
        let productCount;

        for (let product of productData) {
            let finalPrice = product.price;
            let offer = 0;

            const product_offer = await ProductOffer.findOne({
                productName: product._id,
                is_activated: true,
            });
            const category_offer = await CategoryOffer.findOne({
                categoryId: product.categoryName,
                is_activated: true,
            });

            if (product_offer) {
                finalPrice =
                    product.price * ((100 - product_offer.discount) / 100);
                offer = product_offer.discount;
            }
            if (category_offer && offer < category_offer.discount) {
                finalPrice =
                    product.price * ((100 - category_offer.discount) / 100);
                offer = category_offer.discount;
            }

            await Product.findOneAndUpdate(
                { _id: product._id },
                { $set: { finalPrice, offer } },
            );
        }

        //pagination

        let page = parseInt(req.query.page) || 0;
        const limit = 4;
        const skip = page * limit;

        productCount = await Product.find({ is_listed: true }).countDocuments();
        productData = await Product.find({ is_listed: true })
            .populate("categoryName")
            .skip(skip)
            .limit(limit);

        // Filter products where the category is listed
        productData = productData.filter(
            (product) => product.categoryName && product.categoryName.is_listed,
        );

        const categoryData = await Category.find({ is_listed: true });

        //********** NAV ***********
        const cart = await Cart.findOne({ userId: req.session.user_id });
        const wishlist = await Wishlist.findOne({
            userId: req.session.user_id,
        });
        const cartCount = cart ? cart.products.length : 0;
        const wishlistCount = wishlist ? wishlist.products.length : 0;

        // Render the shop view with the fetched product data and product count
        res.render("shop", {
            products: productData,
            productCount,
            page,
            categoryData,
            categorySelected: "All",
            sortSelected: "All",
            searchString: undefined,
            cartCount,
            wishlistCount,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

//loading product data in admin
const loadProductDetails = async (req, res) => {
    try {
        const productId = req.query.productDetails;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.redirect("*");
        }

        const product = await Product.findById(productId)
            .populate("categoryName")
            .exec();

        const allProducts = await Product.find({})
            .populate("categoryName")
            .exec();

        const related = allProducts.filter(
            (value) =>
                value.categoryName._id.equals(product.categoryName._id) &&
                !value._id.equals(product._id),
        );

        //********** NAV ***********
        const cart = await Cart.findOne({ userId: req.session.user_id });
        const wishlist = await Wishlist.findOne({
            userId: req.session.user_id,
        });
        const cartCount = cart ? cart.products.length : 0;
        const wishlistCount = wishlist ? wishlist.products.length : 0;

        if (product) {
            res.render("product", {
                product,
                related,
                cartCount,
                wishlistCount,
            });
        } else {
            return res.redirect("*");
        }
    } catch (error) {
        console.error(error.message, "product Details");
        res.status(500).send("Product not found");
    }
};

const loadProductList = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 0;
        let limit = 8;
        let skip = page * limit;

        const productCount = await Product.find({}).countDocuments();
        const productsData = await Product.find({})
            .populate("categoryName")
            .skip(skip)
            .limit(limit);
        // console.log('darf'+productsData);
        res.render("productList", {
            products: productsData,
            success: "",
            productCount,
            page,
        });
    } catch (error) {
        console.log(error.message);
    }
};

const listProduct = async (req, res) => {
    try {
        const productId = req.query.productId;

        const checking = await Product.findById({ _id: productId });

        if (checking.is_listed == false) {
            const confirmation = await Product.findOneAndUpdate(
                { _id: checking._id },
                { $set: { is_listed: true } },
            );
            res.json(confirmation);
        } else {
            const confirmation = await Product.findOneAndUpdate(
                { _id: checking._id },
                { $set: { is_listed: false } },
            );
            res.json(confirmation);
        }
    } catch (error) {
        console.log(error.message);
    }
};

const loadEditProduct = async (req, res) => {
    try {
        const productId = req.query.productId;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.redirect("*");
        }

        const productDetails = await Product.findById({ _id: productId });
        const categories = await Category.find({ is_listed: true });
        const errmsg = req.flash("errmsg");
        res.render("editProduct", { productDetails, errmsg, categories });
    } catch (error) {
        console.log(error.message);
    }
};

// Note: upload middleware is imported from ../config/cloudinary

const editProduct = async (req, res) => {
    try {
        const productId = req.body.productId;
        const productName = req.body.name; // Ensure the form sends the correct field name

        const exist = await Product.findOne({ name: productName });
        if (exist && exist._id.toString() !== productId) {
            // Ensure the check doesn't fail for the same product
            req.flash("errmsg", "Sorry this product already exists...!!!");
            return res.redirect(`/admin/editProduct?productId=${productId}`);
        } else {
            // Use Cloudinary URL (path) instead of local filename
            const images = req.files["images"]
                ? req.files["images"].map((e) => e.path)
                : [];
            // console.log(images);

            const confirmation = await Product.findOneAndUpdate(
                { _id: productId },
                {
                    $set: {
                        name: req.body.name,
                        price: req.body.price,
                        quantity: {
                            small: req.body.small,
                            medium: req.body.medium,
                            large: req.body.large,
                        },
                        description: req.body.description,
                        images: images.length
                            ? images
                            : req.body.existingImages, // Handle existing images
                        categoryName: req.body.category,
                        is_listed: true,
                    },
                },
                { new: true },
            );

            if (confirmation) {
                res.redirect("/admin/productsList");
            } else {
                res.status(500).json({
                    error: "Internal server error",
                    message: "Could not update product",
                });
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
};

//************** search product ****************
const searchProducts = async (req, res) => {
    try {
        // let page = 0
        let { searchString, categorySelected, sortSelected } = req.query;

        // console.log(searchString,categorySelected,sortSelected);

        if (!searchString) {
            return res.status(400).json({ error: "Search string is required" });
        }

        let searchNumber = parseInt(searchString, 10);

        let searchQuery = {
            $and: [
                { name: { $regex: new RegExp(searchString, "i") } },
                { is_listed: true },
            ],
        };

        if (!isNaN(searchNumber)) {
            searchQuery.$or.push({ price: { $lte: searchNumber } });
        }

        let sortQuery = {};

        if (categorySelected && categorySelected != "All") {
            const category = await Category.findOne({ _id: categorySelected });

            searchQuery.categoryName = category._id;
        }

        if (sortSelected && sortSelected != "All") {
            if (sortSelected == "low-to-high") {
                sortQuery.price = 1;
            } else if (sortSelected == "high-to-low") {
                sortQuery.price = -1;
            }
        }

        // pagination
        let page = parseInt(req.query.page) || 0;

        const limit = 4;
        const skip = page * limit;

        const productCount = await Product.find(searchQuery).countDocuments();
        const products = await Product.find(searchQuery)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit)
            .populate("categoryName");
        // console.log('from the search',products)

        //ctegory data
        const categoryData = await Category.find({ is_listed: true });

        const cart = await Cart.findOne({ userId: req.session.user_id });
        const wishlist = await Wishlist.findOne({
            userId: req.session.user_id,
        });
        const cartCount = cart ? cart.products.length : 0;
        const wishlistCount = wishlist ? wishlist.products.length : 0;

        // let products = await Product.find(searchQuery).sort({ price: -1 })
        res.render("shop", {
            products,
            searchString,
            productCount,
            page,
            categoryData,
            categorySelected,
            sortSelected,
            cartCount,
            wishlistCount,
        });
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message);
    }
};

const filterProducts = async (req, res) => {
    try {
        const { searchString, categorySelected, sortSelected } = req.query;

        // console.log(searchString);

        let query = {};
        let sortQuery = {};

        if (categorySelected && categorySelected != "All") {
            const category = await Category.findOne({ _id: categorySelected });

            query.categoryName = category._id;
        }

        if (sortSelected && sortSelected != "All") {
            if (sortSelected == "low-to-high") {
                sortQuery.finalPrice = 1;
            } else if (sortSelected == "high-to-low") {
                sortQuery.finalPrice = -1;
            }
        }

        if (searchString) {
            let searchNumber = parseInt(searchString, 10);

            query = {
                $or: [
                    {
                        name: { $regex: new RegExp(searchString, "i") },
                        is_listed: true,
                    },
                ],
            };

            if (!isNaN(searchNumber)) {
                query.$or.push({ finalPrice: { $lte: searchNumber } });
            }
        }

        console.log(query);

        // pagination
        let page = parseInt(req.query.page) || 0;

        const limit = 4;
        const skip = page * limit;

        const productCount = await Product.find(query).countDocuments();
        const productData = await Product.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit)
            .populate("categoryName");

        //ctegory data
        const categoryData = await Category.find({ is_listed: true });

        const cart = await Cart.findOne({ userId: req.session.user_id });
        const wishlist = await Wishlist.findOne({
            userId: req.session.user_id,
        });
        const cartCount = cart ? cart.products.length : 0;
        const wishlistCount = wishlist ? wishlist.products.length : 0;

        res.render("shop", {
            products: productData,
            productCount,
            page,
            categoryData,
            categorySelected,
            sortSelected,
            searchString,
            wishlistCount,
            cartCount,
        });
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    loadProductDetails,
    loadProductList,
    listProduct,
    loadEditProduct,
    editProduct,
    upload,
    searchProducts,
    shop,
    filterProducts,
};
