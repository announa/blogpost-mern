import { Grid2 } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { Post as PostType } from '../../types/types';
import { handleError } from '../../utils/errorHandling';
import { Loading } from '../loading/Loading';
import { NoData } from '../no-data/NoData';
import { Post } from './components/Post';

export const Posts = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [noDataError, setNoDataError] = useState(false);
  const [loading, setLoading] = useState(true);
  const getPosts = async () => {
    try {
      const posts = await axios.get<PostType[]>(import.meta.env.VITE_POSTS_URL);
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
      <Grid2 container spacing={6}>
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </Grid2>
    </PageContainer>
  );
};
