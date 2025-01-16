import { model, Schema } from 'mongoose';

const ImageSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    file: { type: Buffer, required: false },
    contentType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Image = model('Image', ImageSchema);
