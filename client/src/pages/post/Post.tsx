import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Tooltip } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { Post as IPost } from '../../types/types';
import { handleError } from '../../utils/errorHandling';
import { formatDate } from '../../utils/formatDate';
import { Loading } from '../loading/Loading';
import { NoData } from '../no-data/NoData';
import { DeleteModal } from './delete-modal/DeleteModal';
import { useAuthContext } from '../../context/useAuthContext';

export const Post = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { accessToken, user } = useAuthContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    data: post,
    isLoading,
    isError,
    error: postError,
  } = useQuery({
    queryKey: ['post', id],
    enabled: !!id,
    queryFn: async () => {
      const response = await axios.get<IPost>(`${import.meta.env.VITE_POSTS_URL}/${id}`);
      return response.data;
    },
  });

  const { mutateAsync: deletePost } = useMutation({
    mutationFn: async () =>
      await axios.delete(`${import.meta.env.VITE_POSTS_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    onSuccess: () => {
      enqueueSnackbar('Post successfully deleted', { variant: 'success', autoHideDuration: 3000 });
      navigate(routes.posts.route);
    },
    onError: (error) => handleError(error, enqueueSnackbar),
  });

  const noDataError = useMemo(() => isError || !id, [isError, id]);

  useEffect(() => {
    if (postError) {
      handleError(postError, enqueueSnackbar);
    }
  }, [postError]);

  const userIsAuthor = useMemo(() => user?.id === post?.author.id, [user, post?.author]);

  const handleEditClick = () => {
    navigate(`${routes.updatePost.baseRoute}/${id}`);
  };

  const handleDelete = async () => {
    console.log('Deleting....');
    await deletePost();
  };

  if (noDataError) {
    return <NoData title="Post" />;
  }
  if (isLoading) {
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
            customElement={user && userIsAuthor ? EditButtons : undefined}
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
