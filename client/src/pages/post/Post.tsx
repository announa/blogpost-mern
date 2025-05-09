import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Tooltip } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import sanitize from 'sanitize-html';
import { IconButton } from '../../components/base/icon-button/IconButton';
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
import { DeleteModal } from './delete-modal/DeleteModal';

export const Post = () => {
  const { enqueueSnackbar } = useSnackbar();
  const userContext = useUserContext();
  const navigate = useNavigate();
  const { getAccessToken } = useToken();
  const { id } = useParams();
  const [post, setPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [noDataError, setNoDataError] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const userIsAuthor = useMemo(
    () => userContext?.user?.id === post?.author.id,
    [userContext?.user, post?.author]
  );

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
      const accessToken = await getAccessToken();
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
    return <Loading title="Loading..." />;
  }

  const EditButtons = (
    <Box display="flex" justifyContent="space-between">
      <Tooltip title="Edit Article" disableHoverListener={false}>
        <div>
          <IconButton onClick={handleEditClick}>
            <EditIcon />
          </IconButton>
        </div>
      </Tooltip>
      <Tooltip title="Delete Article">
        <div>
          <IconButton onClick={() => setIsDeleteModalOpen(true)}>
            <DeleteIcon />
          </IconButton>
        </div>
      </Tooltip>
    </Box>
  );

  return (
    <PageContainer>
      <Box flex={1} width="100%">
        <Box marginBottom="24px">
          <PostImage
            src={post?.image?.data}
            imageProps={{ alt: post?.title }}
            boxProps={{ borderRadius: '0 !important' }}
          />
        </Box>
        <Box flex="1">
          <PostInformation>
            <Author>{post?.author.userName}</Author>
            <Date>{formatDate(post?.createdAt)}</Date>{' '}
          </PostInformation>
          <PageHeader
            title={post?.title ?? 'Post not found'}
            customElement={userContext?.user && userIsAuthor ? EditButtons : undefined}
            typographyProps={{ fontWeight: 600, fontSize: '30px' }}
            marginBottom="24px"
          />
          <Summary bold large margin="0 0 48px">
            {post?.summary}
          </Summary>
          <Content dangerouslySetInnerHTML={post?.content ? { __html: sanitize(post.content) } : undefined} />
        </Box>
      </Box>
      <DeleteModal
        isDeleteModalOpen={isDeleteModalOpen}
        onConfirm={handleDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </PageContainer>
  );
};
