const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("connected to mongoose");
  })
  .catch((e) => {
    console.log(`Error in connecting to mongo db => ${e}`);
  });

const PORT = process.env.PORT || 3000

const app = express();
app.listen(process.env.PORT, () => {
  console.log(`SERVER STARTED AT PORT = ${process.env.PORT}`);
});
app.use(express.json());

app.get("/", (req, res) => {
  res.end("Server started");
});


const product = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      unique: true,
    },
    category: {
      type: String,
      enum: ["Electronics", "Clothing", "Food", "Furniture"],
    },
    supplierName: {
      type: String,
      required: true,
    },
    stockQty: {
      type: Number,
      default: 0,
      min: 0,
    },
    unitPrice: {
      type: Number,
      min: 1,
    },
    reorderLevel: {
      type: Number,
      min: 1,
    },
    manufactureDate: {
      type: Date,
    },
    productType: {
      type: String,
      enum: ["Perishable", "Non Perishable"],
      default: "Perishable",
    },
    status: {
      type: String,
      enum: ["Available", "Out of stock"],
      default: "Available",
    },
  },
  { timestamps: true },
);

const PRODUCT = mongoose.model("products", product);

app.get("/products/query", async (req, res) => {
  const { name, category } = req.query;

  if (name && category) {
    const prod = await PRODUCT.find({
      name,
      category,
    });
    if (prod.length === 0) {
      return res.status(404).json({
        status: "Product not found",
      });
    }
    return res.status(200).json({
      status: "Product found",
      product: prod,
    });
  } else if (name) {
    const prod = await PRODUCT.find({
      name,
    });
    if (prod.length === 0) {
      return res.status(404).json({
        status: "Product not found",
      });
    }
    return res.status(200).json({
      status: "Product found",
      product: prod,
    });
  } else {
    const prod = await PRODUCT.find({
      category,
    });
    if (prod.length === 0) {
      return res.status(404).json({
        status: "Product not found",
      });
    }
    return res.status(200).json({
      status: "Product found",
      product: prod,
    });
  }
});
app.post("/products", async (req, res) => {
  const {
    name,
    code,
    category,
    supplierName,
    stockQty,
    unitPrice,
    reorderLevel,
    manufactureDate,
    productType,
    status,
  } = req.body;

  try {
    const newProd = await PRODUCT.create({
      name,
      code,
      category,
      supplierName,
      stockQty,
      unitPrice,
      reorderLevel,
      manufactureDate,
      productType,
      status,
    });
    return res.status(201).json({
      status: "Successfully created new product",
      product: newProd,
    });
  } catch (e) {
    return res.status(400).json({
      status: "Bad request",
      error: e,
    });
  }
});

app.get("/products", async (req, res) => {
  try {
    const allProds = await PRODUCT.find({});
    return res.status(200).json({
      status: "Success",
      Products: allProds,
    });
  } catch (e) {
    return res.status(500).json({
      status: "Internal Server Error",
      error: e.toString(),
    });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = await PRODUCT.findById(id);
    if (product == null) {
      return res.status(404).json({
        status: "Product not found",
      });
    }
    return res.status(200).json({
      status: "Successfully found product",
      product: product,
    });
  } catch (e) {
    return res.status(500).json({
      status: "Internal Server Error",
      error: e,
    });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = await PRODUCT.findById(id);
    if (product == null) {
      return res.status(404).json({
        status: "Product not found",
      });
    }
    const {
      name,
      code,
      category,
      supplierName,
      stockQty,
      unitPrice,
      reorderLevel,
      manufactureDate,
      productType,
      status,
    } = req.body;

    const newProd = await PRODUCT.findByIdAndUpdate(
      id,
      {
        name,
        code,
        category,
        supplierName,
        stockQty,
        unitPrice,
        reorderLevel,
        manufactureDate,
        productType,
        status,
      },
      { new: true },
    );
    return res.status(201).json({
      status: "Successfully Updated product",
      product: newProd,
    });
  } catch (e) {
    return res.status(500).json({
      status: "Error in updating product",
      error: e,
    });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const prod = await PRODUCT.findById(id);
    const result = await PRODUCT.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: "Product not found",
      });
    }

    return res.status(200).json({
      status: "Successfully deleted the product",
    });
  } catch (e) {
    return res.status(500).json({
      status: "Error in deleting product",
      error: e,
    });
  }
});


