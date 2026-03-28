import { Router } from "express";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";

const router = Router();

const ensureCart = async (cid) => {
  if (cid) {
    const existingCart = await Cart.findById(cid).lean();
    if (existingCart) return existingCart._id.toString();
  }

  const firstCart = await Cart.findOne().lean();
  if (firstCart) return firstCart._id.toString();

  const newCart = await Cart.create({ products: [] });
  return newCart._id.toString();
};

router.get(["/", "/home"], (_req, res) => res.redirect("/products"));

router.get("/products", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query, cid } = req.query;
    const cartId = await ensureCart(cid);

    const filter = !query
      ? {}
      : ["true", "false"].includes(String(query).toLowerCase())
        ? { status: String(query).toLowerCase() === "true" }
        : { category: String(query).trim() };

    const options = {
      page: Number(page) > 0 ? Number(page) : 1,
      limit: Number(limit) > 0 ? Number(limit) : 10,
      lean: true
    };
    if (sort === "asc") options.sort = { price: 1 };
    if (sort === "desc") options.sort = { price: -1 };

    const result = await Product.paginate(filter, options);

    const buildLink = (targetPage) => {
      const params = new URLSearchParams();
      params.set("page", targetPage);
      params.set("limit", options.limit);
      params.set("cid", cartId);
      if (sort) params.set("sort", sort);
      if (query) params.set("query", query);
      return `/products?${params.toString()}`;
    };

    res.render("products", {
      title: "Productos",
      products: result.docs,
      cartId,
      totalPages: result.totalPages,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
      nextLink: result.hasNextPage ? buildLink(result.nextPage) : null,
      query: query || "",
      sort: sort || "",
      limit: options.limit,
      hasProducts: result.docs.length > 0
    });
  } catch (error) {
    res.status(500).render("error", { title: "Error", message: error.message });
  }
});

router.get("/products/:pid", async (req, res) => {
  try {
    const cartId = await ensureCart(req.query.cid);
    const product = await Product.findById(req.params.pid).lean();
    if (!product) return res.status(404).render("error", { title: "Error", message: "Producto no encontrado" });
    res.render("productDetail", { title: product.title, product, cartId });
  } catch (error) {
    res.status(500).render("error", { title: "Error", message: error.message });
  }
});

router.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate("products.product").lean();
    if (!cart) return res.status(404).render("error", { title: "Error", message: "Carrito no encontrado" });
    res.render("cart", { title: "Carrito", cart, hasProducts: cart.products.length > 0 });
  } catch (error) {
    res.status(500).render("error", { title: "Error", message: error.message });
  }
});

router.get("/realtimeproducts", async (_req, res) => {
  try {
    const products = await Product.find().lean();
    res.render("realTimeProducts", { title: "Real Time Products", products, hasProducts: products.length > 0 });
  } catch (error) {
    res.status(500).render("error", { title: "Error", message: error.message });
  }
});

export default router;
