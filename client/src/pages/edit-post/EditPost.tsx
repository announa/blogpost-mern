import DeleteIcon from '@mui/icons-material/Delete';
import { Box, CircularProgress, IconButton, styled, TextField, Tooltip } from '@mui/material';
import axios from 'axios';
import { isEqual } from 'lodash';
import { useSnackbar } from 'notistack';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/button/Button';
import { Editor } from '../../components/editor/Editor';
import { PageContainer } from '../../components/page-container/PageContainer';
import { PageHeader } from '../../components/page-header/PageHeader';
import { PaperBackground } from '../../components/paper-background/PaperBackground';
import { PostImage } from '../../components/post-image/PostImage';
import { routes } from '../../config/navigation/navigation';
import { Post } from '../../types/types';
import { handleAxiosError } from '../../utils/error-handling/axiosError';

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
  author: '',
  summary: '',
  content: '',
};

export type PostToEdit = typeof initialPost;
type PostKey = keyof PostToEdit;

export const EditPost = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { pathname } = useLocation();
  const { id } = useParams();
  const [currentPost, setCurrentPost] = useState<PostToEdit | null>(null);
  const [postToUpload, setPostToUpload] = useState(initialPost);
  const [newImage, setNewImage] = useState<File | null | undefined>(undefined);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const shouldUploadImage = useMemo(
    () => (!editMode && newImage) || (editMode && newImage !== undefined),
    [editMode, newImage]
  );

  const isSubmitDisabled = useMemo(
    () => isEqual(currentPost, postToUpload) && !shouldUploadImage,
    [currentPost, postToUpload, shouldUploadImage]
  );

  useEffect(() => {
    if (id) {
      setEditMode(true);
    } else if (pathname !== routes.addPost.route && !id) {
      navigate(routes.addPost.route);
      enqueueSnackbar('Post not found', { variant: 'error' });
    }
  }, []);

  const getPost = async () => {
    try {
      const post = await axios.get<Post>(`${import.meta.env.VITE_POSTS_URL}/${id}`);
      return post.data;
    } catch (error: unknown) {
      handleAxiosError(error, enqueueSnackbar);
    }
  };

  useEffect(() => {
    if (editMode) {
      setLoading(true);
      getPost().then((data) => {
        if (data) {
          setPostToUpload({
            title: data.title,
            author: data.author,
            summary: data.summary,
            content: data.content,
          });
          setCurrentPost({
            title: data.title,
            author: data.author,
            summary: data.summary,
            content: data.content,
          });
        }
        if (data?.image) {
          setCurrentImage(data.image.data);
        }
        setLoading(false);
      });
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
      const token = localStorage.getItem('accessToken');
      const result = await axios.post(import.meta.env.VITE_POSTS_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      enqueueSnackbar('Post successfully added', { variant: 'success' });
      return result.data._id;
    } catch (error: unknown) {
      handleAxiosError(error, enqueueSnackbar);
    }
  };

  const updatePost = async (formData: FormData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const result = await axios.put(`${import.meta.env.VITE_POSTS_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      enqueueSnackbar('Post successfully updated', { variant: 'success' });
      return result.data._id as string;
    } catch (error: unknown) {
      handleAxiosError(error, enqueueSnackbar, 'Post could not be updated');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const formData = createFormData();
    let postId = null;
    if (!editMode) {
      postId = await createPost(formData);
    } else {
      postId = await updatePost(formData);
    }
    if (postId) {
      navigate(`${routes.post.baseRoute}/${postId}`);
    }
  };

  const handleDeleteImage = () => {
    setNewImage(null);
    setCurrentImage(null);
  };

  return (
    <PageContainer>
      <PaperBackground flex={1}>
        <PageHeader title={editMode ? 'Edit Post' : 'Add a new Post'} />
        {loading ? (
          <Box height="100%" display="flex" alignItems="center" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <StyledForm onSubmit={handleSubmit}>
            <TextField
              label="Title"
              value={postToUpload.title}
              type="text"
              onChange={(event) => setPostToUpload({ ...postToUpload, title: event.target.value })}
              sx={{ '.MuiInputBase-root': { backgroundColor: 'white' } }}
            />
            <TextField
              label="Author"
              value={postToUpload.author}
              type="text"
              onChange={(event) => setPostToUpload({ ...postToUpload, author: event.target.value })}
              sx={{ '.MuiInputBase-root': { backgroundColor: 'white' } }}
            />
            <TextField
              label="Summary"
              value={postToUpload.summary}
              type="text"
              onChange={(event) => setPostToUpload({ ...postToUpload, summary: event.target.value })}
              sx={{ '.MuiInputBase-root': { backgroundColor: 'white' } }}
            />
            <Editor post={postToUpload} setPost={setPostToUpload} />
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
              <Box>
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
            <Box display="flex" justifyContent="space-between">
              <Button variant="outlined" onClick={() => navigate(routes.posts.route)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitDisabled}>
                {editMode ? 'Update Post' : 'Add Post'}
              </Button>
            </Box>
          </StyledForm>
        )}
      </PaperBackground>
    </PageContainer>
  );
};
