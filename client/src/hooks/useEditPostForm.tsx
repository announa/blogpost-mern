import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { routes } from '../config/navigation/navigation';
import { useAuthContext } from '../context/useAuthContext';
import { UpdatePostResult } from '../types/types';
import { handleError } from '../utils/errorHandling';

export const initialPost = {
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
type UpdatePostMutationParams = { url: string; formData: FormData; accessToken: string };

export const useEditPostForm = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { accessToken } = useAuthContext();
  const [postToUpload, setPostToUpload] = useState(initialPost);
  const [newImage, setNewImage] = useState<File | null | undefined>(undefined);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showSuccessSnackbar = (message: string) =>
    enqueueSnackbar(message, {
      variant: 'success',
      autoHideDuration: 3000,
    });

  const { mutateAsync: addPostMutation } = useMutation({
    mutationKey: ['updatePostMutation'],
    mutationFn: async ({ url, formData, accessToken }: UpdatePostMutationParams) => {
      const result = await axios.post<UpdatePostResult>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return result.data.id.toString();
    },
    onSuccess: () => showSuccessSnackbar('Post successfully added'),
    onError: (error) => handleError(error, enqueueSnackbar),
  });

  const { mutateAsync: updatePostMutation } = useMutation({
    mutationKey: ['updatePostMutation'],
    mutationFn: async ({ url, formData, accessToken }: UpdatePostMutationParams) => {
      const result = await axios.put<UpdatePostResult>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return result.data.id.toString();
    },
    onSuccess: () => showSuccessSnackbar('Post successfully updated'),
    onError: (error) => handleError(error, enqueueSnackbar),
  });

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
    if (!accessToken) {
      enqueueSnackbar('Unauthorized', { variant: 'error' });
      navigate(routes.login.route, { state: { lastVisited: window.location.href } });
    } else {
      const url = import.meta.env.VITE_POSTS_URL + (id ? `/${id}` : '');
      const requestParams = { url, formData, accessToken };
      return id ? await updatePostMutation(requestParams) : await addPostMutation(requestParams);
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
