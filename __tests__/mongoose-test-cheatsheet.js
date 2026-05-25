/**
 * Mongoose Testing Cheat Sheet (Vitest)
 *
 * This file contains examples and patterns for testing Mongoose models.
 * Use this as a reference when writing your tests.
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { beforeAll, afterAll, afterEach, describe, it, expect } from "vitest";


// ==========================================
// 1. Test Database Setup
// ==========================================

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  // Clean all collections between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Example Product model for demonstration
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true, uppercase: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, default: 0, min: 0 },
  isAvailable: { type: Boolean, default: true },
  category: {
    type: String,
    required: true,
    enum: ["electronics", "clothing", "books", "food"],
  },
});

const Product = mongoose.model("Product", productSchema);

// ==========================================
// 2. Basic CRUD Tests
// ==========================================

describe("Basic CRUD Operations", () => {
  it("should create a product", async () => {
    const product = await Product.create({
      name: "Laptop",
      sku: "LAP123",
      price: 999.99,
      stock: 10,
      category: "electronics",
    });

    expect(product.name).toBe("Laptop");
    expect(product.sku).toBe("LAP123");
    expect(product.price).toBe(999.99);
    expect(product.stock).toBe(10);
  });

  it("should find a product by id", async () => {
    const created = await Product.create({
      name: "Smartphone",
      sku: "PHN456",
      price: 699.99,
      stock: 15,
      category: "electronics",
    });

    const found = await Product.findById(created._id);
    expect(found.name).toBe("Smartphone");
  });

  it("should update a product", async () => {
    const product = await Product.create({
      name: "Headphones",
      sku: "HD789",
      price: 199.99,
      stock: 20,
      category: "electronics",
    });

    const updated = await Product.findByIdAndUpdate(
      product._id,
      { price: 179.99 },
      { new: true }
    );
    expect(updated.price).toBe(179.99);
  });

  it("should delete a product", async () => {
    const product = await Product.create({
      name: "Tablet",
      sku: "TAB101",
      price: 499.99,
      stock: 5,
      category: "electronics",
    });

    await Product.findByIdAndDelete(product._id);
    const deleted = await Product.findById(product._id);
    expect(deleted).toBeNull();
  });
});

// ==========================================
// 3. Validation Tests
// ==========================================

describe("Model Validations", () => {
  it("should not allow duplicate SKUs", async () => {
    await Product.create({
      name: "Camera",
      sku: "CAM202",
      price: 799.99,
      stock: 8,
      category: "electronics",
    });

    await expect(
      Product.create({
        name: "Another Camera",
        sku: "CAM202",
        price: 899.99,
        stock: 3,
        category: "electronics",
      })
    ).rejects.toThrow();
  });

  it("should not allow negative price", async () => {
    await expect(
      Product.create({
        name: "Invalid",
        sku: "NEG303",
        price: -10,
        stock: 5,
        category: "electronics",
      })
    ).rejects.toThrow();
  });

  it("should not allow invalid category", async () => {
    await expect(
      Product.create({
        name: "Invalid Category",
        sku: "CAT505",
        price: 30,
        stock: 10,
        category: "invalid_category",
      })
    ).rejects.toThrow();
  });

  it("should require name", async () => {
    await expect(
      Product.create({ sku: "REQ101", price: 10, stock: 5, category: "books" })
    ).rejects.toThrow();
  });
});

// ==========================================
// 4. Query Tests
// ==========================================

describe("Mongoose Queries", () => {
  beforeEach(async () => {
    await Product.insertMany([
      { name: "Laptop",     sku: "LAP101", price: 999.99, stock: 10, category: "electronics", isAvailable: true  },
      { name: "T-Shirt",   sku: "TSH102", price: 19.99,  stock: 50, category: "clothing",    isAvailable: true  },
      { name: "Novel",     sku: "BOK103", price: 14.99,  stock: 30, category: "books",       isAvailable: true  },
      { name: "Pizza",     sku: "FD104",  price: 9.99,   stock: 100,category: "food",        isAvailable: false },
      { name: "Smartphone",sku: "PHN105", price: 699.99, stock: 15, category: "electronics", isAvailable: true  },
    ]);
  });

  it("should find all products", async () => {
    const products = await Product.find();
    expect(products).toHaveLength(5);
  });

  it("should find available products", async () => {
    const products = await Product.find({ isAvailable: true });
    expect(products).toHaveLength(4);
  });

  it("should find electronics with stock greater than 10", async () => {
    const products = await Product.find({
      category: "electronics",
      stock: { $gt: 10 },
    });
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe("Smartphone");
  });

  it("should find products sorted by price descending", async () => {
    const products = await Product.find().sort({ price: -1 });
    expect(products[0].name).toBe("Laptop");
  });

  it("should limit results", async () => {
    const products = await Product.find().limit(2);
    expect(products).toHaveLength(2);
  });
});

// ==========================================
// 5. Hook Tests
// ==========================================

describe("Model Hooks", () => {
  it("should execute pre-save hook", async () => {
    // Add a pre-save hook to trim the name
    productSchema.pre("save", function (next) {
      this.name = this.name.trim();
      next();
    });

    const product = new Product({
      name: "  Hook Test  ",
      sku: "HOK801",
      price: 29.99,
      stock: 10,
      category: "electronics",
    });

    await product.save();
    expect(product.name).toBe("Hook Test");
  });
});

// ==========================================
// 6. Reference Tests
// ==========================================

// Example: Order references User
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  total: { type: Number, required: true },
});

const Order = mongoose.model("Order", orderSchema);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
});

const User = mongoose.model("TestUser", userSchema);

describe("References and Populate", () => {
  it("should create and populate a reference", async () => {
    const user = await User.create({ username: "testuser", email: "t@t.com" });
    const order = await Order.create({ user: user._id, total: 199.99 });

    const populated = await Order.findById(order._id).populate("user");
    expect(populated.user.username).toBe("testuser");
    expect(populated.total).toBe(199.99);
  });
});

/**
 * Common Testing Patterns:
 *
 * 1. Always use MongoMemoryServer for isolated tests
 * 2. Clean collections between tests with afterEach
 * 3. Test both success and failure cases
 * 4. Test validations and unique constraints
 * 5. Test hooks (pre/post save, remove etc.)
 * 6. Use populate() to test references
 * 7. Use meaningful test descriptions
 *
 * Key Mongoose methods:
 *
 * Model.create(data)                        – create and save
 * Model.find(filter)                        – find many
 * Model.findOne(filter)                     – find one
 * Model.findById(id)                        – find by _id
 * Model.findByIdAndUpdate(id, data, opts)   – update and return
 * Model.findByIdAndDelete(id)               – delete by _id
 * Model.insertMany([...])                   – bulk insert
 * query.populate("field")                   – populate reference
 * query.sort({ field: 1 / -1 })             – sort results
 * query.limit(n)                            – limit results
 */
