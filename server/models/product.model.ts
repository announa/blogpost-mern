import { ObjectId } from 'bson';
import { model, Schema, SchemaType } from 'mongoose';

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
      // id: ObjectId,
      type: Schema.Types.ObjectId,
      ref: 'Image',
      default: null,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = model('Product', ProductSchema);
