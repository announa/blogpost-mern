import { Box, Grid2, styled } from '@mui/material';
import { Link } from '../../../components/base/link/Link';
import { Author, Date, Summary, Title } from '../../../components/post/post-content/PostContent';
import { PostImage } from '../../../components/post/post-image/PostImage';
import { routes } from '../../../config/navigation/navigation';
import { Post as PostType } from '../../../types/types';
import { formatDate } from '../../../utils/formatDate';

const PostContainer = styled(Grid2)({
  transition: 'background 100ms ease-in-out',
  '&:hover': { background: '#f6f6f6' },
});

export interface PostProps {
  post: PostType;
}

export const Post = ({ post }: PostProps) => {
  return (
    <PostContainer key={post.id} size={{ xs: 12, md: 6 }} >
      <Link to={`${routes.post.baseRoute}/${post.id}`} hoverColor="black">
        <Box padding="20px">
          <PostImage
            src={post.image?.data}
            boxProps={{ borderRadius: 0, sx: { backgroundColor: '#f9f9f9' } }}
            imageProps={{ alt: post.title }}
          />

          <Box>
            <Title>{post.title}</Title>
            <Author>{post.author.userName}</Author>
            <Date>{formatDate(post.createdAt)}</Date>
            <Summary>{post.summary}</Summary>
          </Box>
        </Box>
      </Link>
    </PostContainer>
  );
};
