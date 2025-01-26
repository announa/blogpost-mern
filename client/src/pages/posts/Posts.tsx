import { Box, Grid2 } from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { ChangeEvent, useEffect, useState } from 'react';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { PageHeader } from '../../components/page/page-header/PageHeader';
import { SearchField } from '../../components/search-field/SearchField';
import { Post as PostType } from '../../types/types';
import { debounce } from '../../utils/debounce';
import { handleError } from '../../utils/errorHandling';
import { Loading } from '../loading/Loading';
import { NoData } from '../no-data/NoData';
import { Post } from './components/Post';

const initialSearch = {
  author: '',
  summary: '',
};

export const Posts = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [postsToRender, setPostsToRender] = useState<PostType[]>([]);
  const [noDataError, setNoDataError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
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
        setPostsToRender(data);
      }
      setLoading(false);
    });
  }, []);

  const filterPosts = () => {
    const filteredPosts = posts.filter(
      (post) => post.author.userName.includes(search.author) && post.summary.includes(search.summary)
    );
    setPostsToRender(filteredPosts);
  };

  useEffect(() => {
    filterPosts();
  }, [search]);

  const CustomElement = (
    <Box display="flex" gap="24px" paddingRight="20px">
      <SearchField name="author" placeholder="Author" search={search} setSearch={setSearch} />
      <SearchField name="summary" placeholder="Summary" search={search} setSearch={setSearch} />
    </Box>
  );

  if (noDataError) {
    return <NoData title="Posts" />;
  }
  if (loading) {
    return <Loading textAlign="center" title="Posts" />;
  }
  return (
    <PageContainer>
      <PageHeader title="" customElement={CustomElement} />
      <Grid2 width='100%' container spacing={6}>
        {postsToRender.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </Grid2>
    </PageContainer>
  );
};
