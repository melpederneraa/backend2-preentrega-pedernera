import { Router } from "express";
import Product from "../models/product.model.js";

const router = Router();

const buildFilter = (query) => {
  if (!query) return {};
  const normalized = String(query).trim().toLowerCase();
  if (normalized === "true" || normalized === "false") {
    return { status: normalized === "true" };
  }
  return { category: String(query).trim() };
};

const buildLinks = ({ req, result, limit, sort, query }) => {
  const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

  const makeLink = (page) => {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", limit);
    if (sort) params.set("sort", sort);
    if (query) params.set("query", query);
    return `${baseUrl}?${params.toString()}`;
  };

  return {
    prevLink: result.hasPrevPage ? makeLink(result.prevPage) : null,
    nextLink: result.hasNextPage ? makeLink(result.nextPage) : null
  };
};

router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const parsedLimit = Number(limit) > 0 ? Number(limit) : 10;
    const parsedPage = Number(page) > 0 ? Number(page) : 1;

    const options = {
      page: parsedPage,
      limit: parsedLimit,
      lean: true
    };

    if (sort === "asc") options.sort = { price: 1 };
    if (sort === "desc") options.sort = { price: -1 };

    const result = await Product.paginate(buildFilter(query), options);
    const { prevLink, nextLink } = buildLinks({ req, result, limit: parsedLimit, sort, query });

    res.json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink,
      nextLink
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) return res.status(404).json({ status: "error", error: "Producto no encontrado" });
    res.json({ status: "success", payload: product });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const productData = {
      ...req.body,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      status: req.body.status === false || req.body.status === "false" ? false : true,
      thumbnails: Array.isArray(req.body.thumbnails)
        ? req.body.thumbnails
        : req.body.thumbnails
          ? [req.body.thumbnails]
          : []
    };

    const newProduct = await Product.create(productData);
    const io = req.app.get("io");
    if (io) io.emit("productsUpdated", await Product.find().lean());
    res.status(201).json({ status: "success", payload: newProduct });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
    if (updateData.status !== undefined) {
      updateData.status = updateData.status === false || updateData.status === "false" ? false : true;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.pid, updateData, {
      new: true,
      runValidators: true
    }).lean();

    if (!updatedProduct) return res.status(404).json({ status: "error", error: "Producto no encontrado" });
    res.json({ status: "success", payload: updatedProduct });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.pid).lean();
    if (!deletedProduct) return res.status(404).json({ status: "error", error: "Producto no encontrado" });
    const io = req.app.get("io");
    if (io) io.emit("productsUpdated", await Product.find().lean());
    res.json({ status: "success", payload: deletedProduct });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

export default router;
