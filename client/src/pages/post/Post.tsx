import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import sanitize from 'sanitize-html';
import { Button } from '../../components/button/Button';
import { PageContainer } from '../../components/page-container/PageContainer';
import { PageHeader } from '../../components/page-header/PageHeader';
import { Author, Content, Date, PostInformation, Summary } from '../../components/post-content/PostContent';
import { PostImage } from '../../components/post-image/PostImage';
import { routes } from '../../config/navigation/navigation';
import { useUserContext } from '../../context/UserContext';
import { Post as IPost } from '../../types/types';
import { handleError } from '../../utils/errorHandling';
import { getAccessToken } from '../../utils/getToken';
import { Loading } from '../loading/Loading';
import { NoData } from '../no-data/NoData';

export const Post = () => {
  const { enqueueSnackbar } = useSnackbar();
  const userContext = useUserContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [noDataError, setNoDataError] = useState(false);
  const getPost = async () => {
    try {
      const post = await axios.get<IPost>(`${import.meta.env.VITE_POSTS_URL}/${id}`);
      return post.data;
    } catch (error: unknown) {
      handleError(error, enqueueSnackbar);
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
      const accessToken = getAccessToken(enqueueSnackbar);
      await axios.delete(`${import.meta.env.VITE_POSTS_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      enqueueSnackbar('Post successfully deleted', { variant: 'success', autoHideDuration: 3000 });
      navigate(routes.posts.route);
    } catch (error) {
      setNoDataError(true);
      handleError(error, enqueueSnackbar);
    }
  };

  const handleUpdate = () => {
    navigate(`${routes.updatePost.baseRoute}/${id}`);
  };

  if (noDataError) {
    return <NoData title="Post" />;
  }
  if (loading) {
    return <Loading title="Loading..." />;
  }

  return (
    <PageContainer>
      <Box flex={1} width="100%" maxWidth="700px" height="100%">
      <PageHeader title={post?.title ?? 'Post not found'} />
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
          <Content dangerouslySetInnerHTML={post?.content ? { __html: sanitize(post.content) } : undefined} />
        </Box>
        {userContext?.user && (
          <Box display="flex" justifyContent="space-between" marginTop="36px">
            <Button startIcon={<DeleteIcon />} onClick={handleDelete}>
              Delete Post
            </Button>
            <Button startIcon={<EditIcon />} onClick={handleUpdate}>
              Edit Post
            </Button>
          </Box>
        )}
      </Box>
    </PageContainer>
  );
};
