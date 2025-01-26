import axios from 'axios';
import { useSnackbar } from 'notistack';
import { ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { routes } from '../config/navigation/navigation';
import { handleError } from '../utils/errorHandling';
import { useToken } from './useToken';

const initialPost = {
  title: '',
  summary: '',
  content: '',
};

export const errorMessages = {
  title: 'Title is required',
  summary: 'Summary is required',
  content: 'Content is required',
};

export const postInputParser = z.object({
  title: z.string().nonempty({ message: errorMessages.title }),
  summary: z.string().nonempty({ message: errorMessages.summary }),
  content: z
    .string()
    .nonempty({ message: errorMessages.content })
    .refine((value) => {
      const removedLinebreaks = value.replace(/<p><br><\/p>/g, '');
      return removedLinebreaks.length > 0;
    }, 'Invalid content'),
});

export type PostToEdit = typeof initialPost;
type PostKey = keyof PostToEdit;

export const useEditPostForm = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { getAccessToken } = useToken();
  const [postToUpload, setPostToUpload] = useState(initialPost);
  const [newImage, setNewImage] = useState<File | null | undefined>(undefined);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0];
    if (image) {
      setNewImage(image);
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = () => {
        setCurrentImage(reader.result?.toString() ?? null);
      };
    }
  };

  const createFormData = (shouldUploadImage: boolean, currentPost?: PostToEdit | null) => {
    const formData = new FormData();

    for (const key in postToUpload) {
      const postKey = key as PostKey;
      if (!currentPost || currentPost[postKey] !== postToUpload[postKey]) {
        formData.append(postKey, String(postToUpload[postKey]));
      }
    }
    if (shouldUploadImage) {
      formData.append('image', newImage as Blob);
    }
    return formData;
  };

  const createPost = (formData: FormData) => updatePost(formData);

  const updatePost = async (formData: FormData, id?: string) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        enqueueSnackbar('Unauthorized', { variant: 'error' });
        navigate(routes.login.route, { state: { lastVisited: window.location.href } });
      } else {
        const url =import.meta.env.VITE_POSTS_URL + ( id ? `/${id}` : '');
        const fetchMethod = id ? axios.put : axios.post
        const result = await fetchMethod(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        enqueueSnackbar(id ? 'Post successfully updated' : 'Post successfully added', {
          variant: 'success',
          autoHideDuration: 3000,
        });
        return result.data._id as string;
      }
    } catch (error: unknown) {
      handleError(error, enqueueSnackbar, 'Post could not be updated');
    }
  };

  const handleDeleteImage = () => {
    setNewImage(null);
    setCurrentImage(null);
  };

  return {
    currentImage,
    setCurrentImage,
    newImage,
    postToUpload,
    setPostToUpload,
    loading,
    setLoading,
    createPost,
    updatePost,
    createFormData,
    handleDeleteImage,
    uploadImage,
  };
};
