import { Router } from "express";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

const router = Router();

router.post("/", async (_req, res) => {
  try {
    const cart = await Cart.create({ products: [] });
    res.status(201).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate("products.product").lean();
    if (!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" });
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" });

    const product = await Product.findById(pid);
    if (!product) return res.status(404).json({ status: "error", error: "Producto no encontrado" });

    const item = cart.products.find((p) => p.product.toString() === pid);
    if (item) item.quantity += 1;
    else cart.products.push({ product: pid, quantity: 1 });

    await cart.save();
    const populatedCart = await Cart.findById(cid).populate("products.product").lean();
    res.json({ status: "success", payload: populatedCart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" });

    cart.products = cart.products.filter((item) => item.product.toString() !== pid);
    await cart.save();
    const populatedCart = await Cart.findById(cid).populate("products.product").lean();
    res.json({ status: "success", payload: populatedCart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.put("/:cid", async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ status: "error", error: "Debes enviar un arreglo de productos" });
    }

    for (const item of products) {
      const exists = await Product.findById(item.product);
      if (!exists) {
        return res.status(404).json({ status: "error", error: `Producto inexistente: ${item.product}` });
      }
    }

    const normalizedProducts = products.map((item) => ({
      product: item.product,
      quantity: Number(item.quantity) || 1
    }));

    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.cid,
      { products: normalizedProducts },
      { new: true, runValidators: true }
    ).populate("products.product").lean();

    if (!updatedCart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" });
    res.json({ status: "success", payload: updatedCart });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
});

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const quantity = Number(req.body.quantity);
    if (!quantity || quantity < 1) {
      return res.status(400).json({ status: "error", error: "La quantity debe ser mayor o igual a 1" });
    }

    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" });

    const item = cart.products.find((p) => p.product.toString() === req.params.pid);
    if (!item) {
      return res.status(404).json({ status: "error", error: "Producto no encontrado en el carrito" });
    }

    item.quantity = quantity;
    await cart.save();

    const populatedCart = await Cart.findById(req.params.cid).populate("products.product").lean();
    res.json({ status: "success", payload: populatedCart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" });
    cart.products = [];
    await cart.save();
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

export default router;
