import express from 'express';
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from '../controllers/product.controller';
import { upload } from '../middleware/upload-file';

const router = express.Router();


router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', upload.single('image'), createProduct);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
