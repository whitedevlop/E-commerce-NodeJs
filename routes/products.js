const { Product } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpeg",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

// @desc      Get all products displaying name and image only
// @route     GET /api/v1/products
// @access    public
router.get(`/`, async (req, res) => {
  // localhost:3000/api/v1/products?categories=23456545,325355664
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }

  const productList = await Product.find().populate("category"); //here "-_id" is used to hide the "id" from displaying

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

// @desc      Get a single product by id
// @route     GET /api/v1/products/:id
// @access    public
router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product)
    return res.status(500).json({
      success: false,
      message: `Product with ${req.params.id} is not available`,
    });
  res.status(200).send(product);
});

// @desc      Create a new product
// @route     POST /api/v1/products
// @access    private
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const file = req.file;
  if (!file) return res.status(400).send("No image in the request");

  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();

  if (!product) return res.status(500).send("The product cannot be created");

  res.send(product);
});

// @desc      Update a product by id
// @route     PUT /api/v1/products/:id
// @access    Private
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Product Id");
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );
  if (!product) return res.status(404).send("The product cannot be created!");
  res.send(product);
});

// @desc        Delete a product by id
// @route       DELETE/api/v1/products/:id
// @access      private
router.delete("/:id", (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "The product is deleted " });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

// @desc      Get count of all products
// @route     GET /api/v1/products/get/count
// @access    private
router.get("/get/count", async (req, res) => {
  let productCount = await Product.countDocuments();
  if (!productCount) return res.status(500).json({ success: false });

  res.status(200).send({
    productCount: productCount,
  });
});

// @desc      Get featured  products
// @route     GET /api/v1/products/get/featured/:count
// @access    private
router.get("/get/featured/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  let products = await Product.find({ isFeatured: true }).limit(+count);
  if (!products) return res.status(500).json({ success: false });

  res.status(200).send(products);
});

router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }
    const files = req.files;
    console.log(req.files);
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );

    if (!product) return res.status(500).send("the gallery cannot be updated!");

    res.send(product);
  }
);

module.exports = router;
