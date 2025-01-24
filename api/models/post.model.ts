import { model, Schema } from 'mongoose';

const PostSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please enter post title'],
    },
    summary: {
      type: String,
      required: [true, 'Please enter a post summary'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Please enter the post content'],
      default: 0,
    },
    image: {
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

export const Post = model('Post', PostSchema);
