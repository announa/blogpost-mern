import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import sanitize from 'sanitize-html';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { PageHeader } from '../../components/page/page-header/PageHeader';
import {
  Author,
  Content,
  Date,
  PostInformation,
  Summary,
} from '../../components/post/post-content/PostContent';
import { PostImage } from '../../components/post/post-image/PostImage';
import { routes } from '../../config/navigation/navigation';
import { useUserContext } from '../../context/useUserContext';
import { useToken } from '../../hooks/useToken';
import { Post as IPost } from '../../types/types';
import { handleError } from '../../utils/errorHandling';
import { formatDate } from '../../utils/formatDate';
import { Loading } from '../loading/Loading';
import { NoData } from '../no-data/NoData';

export const Post = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const userContext = useUserContext();
  const navigate = useNavigate();
  const { getAccessToken } = useToken();
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
      const accessToken = getAccessToken();
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

  const handleEditClick = () => {
    navigate(`${routes.updatePost.baseRoute}/${id}`);
  };

  if (noDataError) {
    return <NoData title="Post" />;
  }
  if (loading) {
    return <Loading title="Loading..." maxWidth="700px" />;
  }

  const EditButtons = (
    <Box display="flex" justifyContent="space-between">
      <Tooltip title="Edit Article">
        <IconButton sx={{ '&:focus': { outline: 'none' } }} onClick={handleEditClick}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete Article">
        <IconButton sx={{ '&:focus': { outline: 'none' } }} onClick={handleDelete}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <PageContainer>
      <Box
        flex={1}
        maxWidth="700px"
        sx={{
          [theme.breakpoints.up('md')]: {
            width: '75%',
          },
        }}
      >
        <PageHeader
          title={post?.title ?? 'Post not found'}
          customElement={userContext?.user ? EditButtons : undefined}
        />
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
            <Date>{formatDate(post?.createdAt)}</Date>{' '}
          </PostInformation>
          <Summary>{post?.summary}</Summary>
          <Content dangerouslySetInnerHTML={post?.content ? { __html: sanitize(post.content) } : undefined} />
        </Box>
      </Box>
    </PageContainer>
  );
};
