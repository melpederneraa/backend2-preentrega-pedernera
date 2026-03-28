import express from "express";
import handlebars from "express-handlebars";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import Product from "./models/product.model.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.engine("handlebars", handlebars.engine({
  helpers: {
    eq: (a, b) => a === b,
    multiply: (a, b) => Number(a) * Number(b)
  }
}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

const httpServer = createServer(app);
export const socketServer = new Server(httpServer);
app.set("io", socketServer);

socketServer.on("connection", async (socket) => {
  socket.emit("productsUpdated", await Product.find().lean());

  socket.on("addProduct", async (product) => {
    try {
      await Product.create({
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
        status: product.status === false || product.status === "false" ? false : true,
        thumbnails: product.thumbnails ? [product.thumbnails] : []
      });
      socketServer.emit("productsUpdated", await Product.find().lean());
    } catch (error) {
      socket.emit("productError", error.message);
    }
  });

  socket.on("deleteProduct", async (productId) => {
    try {
      const deleted = await Product.findByIdAndDelete(productId);
      if (!deleted) return socket.emit("productError", "Producto no encontrado");
      socketServer.emit("productsUpdated", await Product.find().lean());
    } catch (error) {
      socket.emit("productError", error.message);
    }
  });
});

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("Error al conectar Mongo:", error.message);
  });
