import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import sanitize from 'sanitize-html';
import { Button } from '../../components/button/Button';
import { PageHeader } from '../../components/page-header/PageHeader';
import { Author, Content, Date, PostInformation, Summary } from '../../components/post-content/PostContent';
import { PostImage } from '../../components/post-image/PostImage';
import { routes } from '../../config/navigation/navigation';
import { Post as IPost } from '../../types/types';
import { handleAxiosError } from '../../utils/errorHandling';
import { ContentContainer } from '../../components/content-container/ContentContainer';

export const Post = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(true);
  const getPost = async () => {
    try {
      const post = await axios.get<IPost>(`${import.meta.env.VITE_POSTS_URL}/${id}`);
      return post.data;
    } catch (error: unknown) {
      handleAxiosError(error, enqueueSnackbar);
    }
  };

  useEffect(() => {
    getPost().then((data) => {
      if (data) {
        setPost(data);
      }
      setLoading(false);
    });
  }, []);

  const handleDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_POSTS_URL}/${id}`);
      enqueueSnackbar('Post successfully deleted', { variant: 'success', autoHideDuration: 3000 });
      navigate(routes.posts.route);
    } catch (error: unknown) {
      handleAxiosError(error, enqueueSnackbar);
    }
  };

  const handleUpdate = () => {
    navigate(`${routes.updatePost.baseRoute}/${id}`);
  };

  return (
    <ContentContainer>
      <Box width="100%" maxWidth="700px" height="100%">
        {/* <PaperCard> */}
        {loading ? <PageHeader title="Loading..." /> : <PageHeader title={post?.title ?? 'Post not found'} />}
        {loading ? (
          <Box height="100%" display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box marginBottom="24px">
              <PostImage
                src={post?.image?.data}
                imageProps={{ alt: post?.title }}
                boxProps={{ borderRadius: '0 !important' }}
              />
            </Box>
            <Box flex="1">
              <PostInformation>
                <Author>{post?.author}</Author>
                <Date>{post?.createdAt}</Date>{' '}
              </PostInformation>
              <Summary>{post?.summary}</Summary>
              <Content
                dangerouslySetInnerHTML={post?.content ? { __html: sanitize(post.content) } : undefined}
              />
            </Box>
          </>
        )}
        {/* </PaperCard> */}
        <Box display="flex" justifyContent="space-between" marginTop="36px">
          <Button startIcon={<DeleteIcon />} onClick={handleDelete}>
            Delete Post
          </Button>
          <Button startIcon={<EditIcon />} onClick={handleUpdate}>
            Edit Post
          </Button>
        </Box>
      </Box>
    </ContentContainer>
  );
};
