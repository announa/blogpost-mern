import { model, Schema } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
    },
    quantity: {
      type: Number,
      required: false,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Please enter the price'],
    },
    image: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = model('Product', ProductSchema);
