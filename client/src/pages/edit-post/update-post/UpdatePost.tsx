import axios from 'axios';
import { isEqual } from 'lodash';
import { useSnackbar } from 'notistack';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import { useNavigate, useParams } from 'react-router-dom';
import { routes } from '../../../config/navigation/navigation';
import { useUserContext } from '../../../context/useUserContext';
import { errorMessages, postInputParser, PostToEdit, useEditPostForm } from '../../../hooks/useEditPostForm';
import { useError } from '../../../hooks/useError';
import { Post } from '../../../types/types';
import { handleError } from '../../../utils/errorHandling';
import { Loading } from '../../loading/Loading';
import { EditPost } from '../component/EditPost';
import { useTheme } from '@mui/material';

export const UpdatePost = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const { id } = useParams();
  const userContext = useUserContext();
  const [currentPost, setCurrentPost] = useState<PostToEdit | null>(null);
  const [author, setAuthor] = useState<string | null>(null);

  const {
    postToUpload,
    setPostToUpload,
    currentImage,
    setCurrentImage,
    newImage,
    loading,
    setLoading,
    uploadImage,
    createFormData,
    updatePost,
    handleDeleteImage,
  } = useEditPostForm();

  const { error, validateInput, validatedInput } = useError({
    data: postToUpload,
    errorMessages: errorMessages,
    inputParser: postInputParser,
  });

  const fetchPostData = async () => {
    try {
      setLoading(true);
      const post = await axios.get<Post>(`${import.meta.env.VITE_POSTS_URL}/${id}`);
      const data = post.data;
      if (data) {
        const { image, author, ...postData } = data;
        setCurrentPost(postData);
        setAuthor(author.id);
        if (image) {
          setCurrentImage(image.data);
        }
      }
      setLoading(false);
      return data;
    } catch (error: unknown) {
      setLoading(false);
      handleError(error, enqueueSnackbar);
    }
  };

  useEffect(() => {
    fetchPostData().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (currentPost) {
      setPostToUpload(currentPost);
    }
  }, [currentPost]);

  const shouldUploadImage = useMemo(() => newImage !== undefined, [newImage]);

  const isSubmitDisabled = useMemo(() => {
    const sanitizedCurrentContent = currentPost?.content.replace('\r\n', '\n');
    const sanitizedPostToUploadContent = postToUpload?.content.replace('\r\n', '\n');
    return (
      (isEqual(
        { ...currentPost, content: sanitizedCurrentContent },
        { ...postToUpload, content: sanitizedPostToUploadContent }
      ) &&
        !shouldUploadImage) ||
      !validatedInput.success
    );
  }, [postToUpload, shouldUploadImage, validatedInput]);

  const userIsAuthor = useMemo(() => {
    return userContext?.user?.id === author;
  }, [author, userContext]);

  useEffect(() => {
    if (currentPost && id && !userIsAuthor) {
      navigate(routes.addPost.route);
      enqueueSnackbar('Unauthorized', { variant: 'error', autoHideDuration: 3000 });
    }
  }, [currentPost, userIsAuthor]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const formData = createFormData(shouldUploadImage, currentPost);
    setLoading(true);
    const postIdResult = await updatePost(formData, id);
    if (postIdResult) {
      navigate(`${routes.post.baseRoute}/${postIdResult}`);
    } else {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Loading
        title={currentPost ? 'Updating Article' : 'Loading...'}
        sx={{
          [theme.breakpoints.up('md')]: {
            width: '75%',
          },
        }}
      />
    );
  }

  return (
    <EditPost
      currentImage={currentImage}
      postToUpload={postToUpload}
      error={error}
      headerText="Edit Article"
      submitButtonText="Update Article"
      cancelRedirectUrl={`${routes.post.baseRoute}/${id}`}
      isSubmitDisabled={isSubmitDisabled}
      setPostToUpload={setPostToUpload}
      onChangeImage={uploadImage}
      onDeleteImage={handleDeleteImage}
      validateInput={validateInput}
      onSubmit={onSubmit}
    />
  );
};
