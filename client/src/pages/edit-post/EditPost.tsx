import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, styled, TextField, Tooltip } from '@mui/material';
import axios from 'axios';
import { isEqual } from 'lodash';
import { useSnackbar } from 'notistack';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '../../components/base/button/Button';
import { ErrorMessage } from '../../components/base/error-message/ErrorMessage';
import { Editor } from '../../components/editor/Editor';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { PageHeader } from '../../components/page/page-header/PageHeader';
import { PostImage } from '../../components/post/post-image/PostImage';
import { routes } from '../../config/navigation/navigation';
import { useError } from '../../hooks/useError';
import { useToken } from '../../hooks/useToken';
import { Post } from '../../types/types';
import { handleError } from '../../utils/errorHandling';
import { Loading } from '../loading/Loading';

const StyledForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  width: '100%',
  [theme.breakpoints.up('md')]: {
    width: '75%',
  },
}));

const DeleteImageButton = styled(IconButton)({
  position: 'absolute',
  top: 10,
  right: 10,
});

const initialPost = {
  title: '',
  summary: '',
  content: '',
};

const errorMessages = {
  title: 'Title is required',
  summary: 'Summary is required',
  content: 'Content is required',
};

const postInputParser = z.object({
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

export const EditPost = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { pathname } = useLocation();
  const { id } = useParams();
  const { getAccessToken } = useToken();
  const [currentPost, setCurrentPost] = useState<PostToEdit | null>(null);
  const [postToUpload, setPostToUpload] = useState(initialPost);
  const [newImage, setNewImage] = useState<File | null | undefined>(undefined);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { error, validateInput, validatedInput } = useError({
    data: postToUpload,
    errorMessages,
    inputParser: postInputParser,
  });

  const shouldUploadImage = useMemo(
    () => (!editMode && newImage) || (editMode && newImage !== undefined),
    [editMode, newImage]
  );

  const isSubmitDisabled = useMemo(() => {
    const sanitizedCurrentContent = currentPost?.content.replace('\r\n', '\n');
    const sanitizedPostToUploadContent = postToUpload?.content.replace('\r\n', '\n');
    if (editMode) {
      return (
        (isEqual(
          { ...currentPost, content: sanitizedCurrentContent },
          { ...postToUpload, content: sanitizedPostToUploadContent }
        ) &&
          !shouldUploadImage) ||
        !validatedInput.success
      );
    } else {
      return !validatedInput.success;
    }
  }, [postToUpload, shouldUploadImage]);

  const pageTitle = useMemo(() => {
    const title = editMode ? 'Edit Article' : 'Write an Article';
    if (loading && isSubmitDisabled) {
      return 'Loading...';
    } else if (loading && !isSubmitDisabled) {
      return 'Updating Post...';
    } else {
      return title;
    }
  }, [loading, editMode, isSubmitDisabled]);

  useEffect(() => {
    setEditMode(!!id);
    if (pathname !== routes.addPost.route && !id) {
      navigate(routes.addPost.route);
      enqueueSnackbar('Post not found', { variant: 'error', autoHideDuration: 3000 });
    }
  }, [pathname, id]);

  useEffect(() => {
    setPostToUpload(currentPost ?? initialPost);
  }, [currentPost]);

  const clearState = () => {
    setCurrentPost(null);
    setCurrentImage(null);
  };

  const getPost = async () => {
    try {
      const post = await axios.get<Post>(`${import.meta.env.VITE_POSTS_URL}/${id}`);
      return post.data;
    } catch (error: unknown) {
      handleError(error, enqueueSnackbar);
    }
  };

  useEffect(() => {
    if (editMode) {
      setLoading(true);
      getPost().then((data) => {
        if (data) {
        const {image, ...postData} = data
          setCurrentPost(postData);
          if (image) {
            setCurrentImage(image.data);
          }
        }
        setLoading(false);
      });
    } else if (currentPost) {
      clearState();
    }
  }, [editMode]);

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

  const createFormData = () => {
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

  const createPost = async (formData: FormData) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        navigate(routes.login.route, { state: { lastVisited: window.location.href } });
      }

      const result = await axios.post(import.meta.env.VITE_POSTS_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      enqueueSnackbar('Post successfully added', { variant: 'success', autoHideDuration: 3000 });
      return result.data._id;
    } catch (error: unknown) {
      handleError(error, enqueueSnackbar);
    }
  };

  const updatePost = async (formData: FormData) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        enqueueSnackbar('Unauthorized', { variant: 'error' });
        navigate(routes.login.route, { state: { lastVisited: window.location.href } });
      } else {
        const result = await axios.put(`${import.meta.env.VITE_POSTS_URL}/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        enqueueSnackbar('Post successfully updated', { variant: 'success', autoHideDuration: 3000 });
        return result.data._id as string;
      }
    } catch (error: unknown) {
      handleError(error, enqueueSnackbar, 'Post could not be updated');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const formData = createFormData();
    let postId = null;
    setLoading(true);
    if (!editMode) {
      postId = await createPost(formData);
    } else {
      postId = await updatePost(formData);
    }
    if (postId) {
      navigate(`${routes.post.baseRoute}/${postId}`);
    } else {
      setLoading(false);
    }
  };

  const handleDeleteImage = () => {
    setNewImage(null);
    setCurrentImage(null);
  };

  if (loading) {
    return <Loading title={pageTitle} maxWidth="700px" />;
  }

  return (
    <PageContainer key={id}>
      <PageHeader title={pageTitle} />

      <StyledForm onSubmit={handleSubmit}>
        <div>
          <TextField
            name="title"
            label="Title"
            value={postToUpload.title}
            type="text"
            required
            fullWidth
            onBlur={() => validateInput('title')}
            onChange={(event) => setPostToUpload({ ...postToUpload, title: event.target.value })}
            sx={{ '.MuiInputBase-root': { backgroundColor: 'white' } }}
          />
          {error.title && <ErrorMessage>{error.title}</ErrorMessage>}
        </div>
        <div>
          <TextField
            label="Summary"
            multiline
            maxRows={3}
            required
            fullWidth
            value={postToUpload.summary}
            type="text"
            onBlur={() => validateInput('summary')}
            onChange={(event) => setPostToUpload({ ...postToUpload, summary: event.target.value })}
            sx={{ '.MuiInputBase-root': { backgroundColor: 'white' } }}
          />
          {error.summary && <ErrorMessage>{error.summary}</ErrorMessage>}
        </div>
        <div>
          <Editor onBlur={() => validateInput('content')} content={postToUpload.content} setPost={setPostToUpload} />
          {error.content && <ErrorMessage>{error.content}</ErrorMessage>}
        </div>
        <input type="file" onChange={uploadImage} />
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="100%"
          sx={{ aspectRatio: '2' }}
          position="relative"
          border={currentImage ? 'none' : '1px solid #cdcdcd'}
          borderRadius="4px"
        >
          <Box flex={1}>
            <PostImage src={currentImage} />
            {currentImage && (
              <Tooltip title="Delete Image">
                <DeleteImageButton
                  size="small"
                  sx={{
                    backgroundColor: 'white',
                    '&:hover': { backgroundColor: 'white', boxShadow: '0 0 4px white' },
                  }}
                  onClick={handleDeleteImage}
                >
                  <DeleteIcon />
                </DeleteImageButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between" gap="24px">
          <Button variant="outlined" onClick={() => navigate(`${routes.post.baseRoute}/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitDisabled}>
            {editMode ? 'Update Post' : 'Add Post'}
          </Button>
        </Box>
      </StyledForm>
    </PageContainer>
  );
};
