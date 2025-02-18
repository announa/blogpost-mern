import { Box, FormControl, Grid2, InputLabel, MenuItem, Select, styled } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { PageHeader } from '../../components/page/page-header/PageHeader';
import { SearchField } from '../../components/search-field/SearchField';
import { Post as PostType } from '../../types/types';
import { handleError } from '../../utils/errorHandling';
import { Loading } from '../loading/Loading';
import { NoData } from '../no-data/NoData';
import { Post } from './components/Post';

const StyledMenuItem = styled(MenuItem)({
  fontSize: '14px',
});

const initialSearch = {
  author: '',
  summary: '',
};

type OrderByDirection = 'asc' | 'desc';
type OrderByCategory = 'date' | 'author' | 'title';

type OrderByType = {
  category: OrderByCategory;
  direction: OrderByDirection;
};

const orderByCombinations: OrderBy = {
  dateAsc: { category: 'date', direction: 'asc' },
  dateDesc: { category: 'date', direction: 'desc' },
  titleAsc: { category: 'title', direction: 'asc' },
  titleDesc: { category: 'title', direction: 'desc' },
  authorAsc: { category: 'author', direction: 'asc' },
  authorDesc: { category: 'author', direction: 'desc' },
};
// type OrderBy = typeof orderBy

type OrderByKey = 'dateAsc' | 'dateDesc' | 'titleAsc' | 'titleDesc' | 'authorAsc' | 'authorDesc';

type OrderBy = Record<OrderByKey, OrderByType>;

export const Posts = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [postsToRender, setPostsToRender] = useState<PostType[]>([]);
  const [noDataError, setNoDataError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [orderBy, setOrderBy] = useState<OrderByKey>('dateDesc');

  const getPosts = async (search?: typeof initialSearch) => {
    const authorQueryParam = `${search?.author ? '?author=' + search.author : ''}`;
    const summaryQueryParam = `${search?.summary ? 'summary=' + search.summary : ''}`;
    try {
      const posts = await axios.get<PostType[]>(
        import.meta.env.VITE_POSTS_URL + authorQueryParam + summaryQueryParam
      );
      const data = posts.data;
      if (data) {
        setPosts(data);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setNoDataError(true);
      handleError(error, enqueueSnackbar);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  useEffect(() => {
    const filteredPosts = filterPosts();
    const orderedPosts = sortBy(filteredPosts);
    setPostsToRender(orderedPosts);
  }, [posts, orderBy, search]);

  const filterPosts = () => {
    return posts.filter(
      (post) => post.author.userName.includes(search.author) && post.summary.includes(search.summary)
    );
  };

  const sortBy = (posts: PostType[]) => {
    const orderBySelection = orderByCombinations[orderBy];
    const orderDirection = orderBySelection.direction === 'asc' ? 1 : -1;
    if (orderBySelection.category === 'author') {
      return posts.sort((a, b) => a.author.userName.localeCompare(b.author.userName) * orderDirection);
    } else if (orderBySelection.category === 'title') {
      return posts.sort((a, b) => a.title.localeCompare(b.title) * orderDirection);
    } else {
      return posts.sort(
        (a, b) => (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * orderDirection
      );
    }
  };

  const handleOrderByChange = (event: SelectChangeEvent<OrderByKey>) => {
    setOrderBy(event.target.value as OrderByKey);
  };

  const SearchFields = (
    <Box width="100%" display="flex" justifyContent="center" gap="24px" marginTop="50px">
      <SearchField variant="outlined" placeholder="Author" search={search} setSearch={setSearch} />
      <SearchField
        variant="outlined"
        name="summary"
        placeholder="Summary"
        search={search}
        setSearch={setSearch}
      />
      <FormControl size="small" sx={{ flex: 1, maxWidth: '250px' }}>
        <InputLabel id="orderBy">Order by</InputLabel>
        <Select
          value={orderBy}
          labelId="orderBy"
          label="Order by"
          onChange={handleOrderByChange}
          sx={{ fontSize: '14px' }}
        >
          <StyledMenuItem value="dateAsc">Date ascending</StyledMenuItem>
          <StyledMenuItem value="dateDesc">Date descending</StyledMenuItem>
          <StyledMenuItem value="titleAsc">Title ascending</StyledMenuItem>
          <StyledMenuItem value="titleDesc">Title descending</StyledMenuItem>
          <StyledMenuItem value="authorAsc">Author ascending</StyledMenuItem>
          <StyledMenuItem value="authorDesc">Author descending</StyledMenuItem>
        </Select>
      </FormControl>
    </Box>
  );

  if (noDataError) {
    return <NoData title="Posts" />;
  }
  if (loading) {
    return <Loading title="Loading..." />;
  }
  return (
    <PageContainer padding="60px 0 0">
      <PageHeader title="" customElement={SearchFields} padding="0 65px 0 50px" />
      <Grid2 width="100%" container spacing={1} overflow="auto" padding="0 40px">
        {postsToRender.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </Grid2>
    </PageContainer>
  );
};
