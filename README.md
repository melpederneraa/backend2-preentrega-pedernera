# Backend Ecommerce - Entrega Final

## Requisitos
- Node.js 22+
- MongoDB Community o MongoDB Atlas

## Instalación
```bash
npm install
npm run dev
```

## Mongo local
Este proyecto intenta conectarse primero a `process.env.MONGO_URL` y, si no existe, usa:

`mongodb://127.0.0.1:27017/ecommerce`

## Rutas principales
- `GET /api/products`
- `GET /api/products/:pid`
- `POST /api/products`
- `PUT /api/products/:pid`
- `DELETE /api/products/:pid`
- `POST /api/carts`
- `GET /api/carts/:cid`
- `POST /api/carts/:cid/products/:pid`
- `DELETE /api/carts/:cid/products/:pid`
- `PUT /api/carts/:cid`
- `PUT /api/carts/:cid/products/:pid`
- `DELETE /api/carts/:cid`
- `GET /products`
- `GET /products/:pid`
- `GET /carts/:cid`
- `GET /realtimeproducts`

## Query params de productos
Ejemplo:
`/api/products?limit=5&page=1&sort=asc&query=ropa`

- `limit`: cantidad por página
- `page`: página a traer
- `sort`: `asc` o `desc` por precio
- `query`: categoría o disponibilidad (`true` / `false`)
