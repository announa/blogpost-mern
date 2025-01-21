import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { Box, Grid2 } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Link } from '../../components/base/link/Link';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { PageHeader } from '../../components/page/page-header/PageHeader';
import { Author, Date, Summary } from '../../components/post/post-content/PostContent';
import { PostImage } from '../../components/post/post-image/PostImage';
import { routes } from '../../config/navigation/navigation';
import { Post } from '../../types/types';
import { handleError } from '../../utils/errorHandling';
import { Loading } from '../loading/Loading';
import { NoData } from '../no-data/NoData';

export const Posts = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [posts, setPosts] = useState<Post[]>([]);
  const [noDataError, setNoDataError] = useState(false);
  const [loading, setLoading] = useState(true);
  const getPosts = async () => {
    try {
      const posts = await axios.get<Post[]>(import.meta.env.VITE_POSTS_URL);
      return posts.data;
    } catch (error) {
      setNoDataError(true);
      handleError(error, enqueueSnackbar);
    }
  };

  useEffect(() => {
    getPosts().then((data) => {
      if (data) {
        setPosts(data);
      }
      setLoading(false);
    });
  }, []);

  if (noDataError) {
    return <NoData title="Posts" />;
  }
  if (loading) {
    return <Loading textAlign="center" title="Posts" />;
  }
  return (
    <PageContainer>
      <PageHeader title="Posts" />
      <Grid2 container spacing={6}>
        {posts.map((post) => (
          <Grid2 key={post.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <Link to={`${routes.post.baseRoute}/${post.id}`}>
              <Box>
                {post.image ? (
                  <PostImage src={post.image?.data} imageProps={{ alt: post.title }} />
                ) : (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    width="100%"
                    sx={{ aspectRatio: '1.2' }}
                  >
                    <ImageOutlinedIcon color="disabled" sx={{ fontSize: '80px' }} />
                  </Box>
                )}
                <Box>
                  {post.title}
                  <Author>{post.author}</Author>
                  <Date>{post.createdAt}</Date>
                  <Summary>{post.summary}</Summary>
                </Box>
              </Box>
            </Link>
          </Grid2>
        ))}
      </Grid2>
    </PageContainer>
  );
};
