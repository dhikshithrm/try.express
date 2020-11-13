const express = require("express");
const router = express.Router();

const { getProductById, createProduct , getProduct, photo, deleteProduct, updateProduct,getAllProducts} = require("../controllers/product");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");
const {getCategoryById} = require("../controllers/category");

//all of params
router.param("userId", getUserById);
router.param("productId", getProductById);
router.param("categortyId", getCategoryById);
//all of actual routes
router.post(
  "/product/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createProduct
);

router.get("/product/:productId", getProduct);
router.get("/product/photo/:productId", photo);
router.delete("/product/:productId/:userId",isSignedIn, isAuthenticated,isAdmin,deleteProduct);
router.put("/product/:productId/:userId",isSignedIn,isAuthenticated,isAdmin, updateProduct);


router.get("/products", getAllProducts);


module.exports = router;
