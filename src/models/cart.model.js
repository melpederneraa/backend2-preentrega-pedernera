import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: 1
        }
      }
    ]
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Cart", cartSchema);
