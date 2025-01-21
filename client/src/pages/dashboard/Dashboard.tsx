import { Grid2 } from '@mui/material';
import { Link } from '../../components/base/link/Link';
import { PaperBackground } from '../../components/base/paper-background/PaperBackground';
import { PaperCard } from '../../components/base/paper-card/PaperCard';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { PageHeader } from '../../components/page/page-header/PageHeader';
import { routes } from '../../config/navigation/navigation';

export const Dashboard = () => {
  const actions = [
    { title: 'All Posts', route: routes.posts.route },
    { title: 'Add Post', route: routes.addPost.route },
  ];
  return (
    <PageContainer>
      <PageHeader title="Dashboard" />
      <PaperBackground flex={1}>
        <Grid2 container spacing={6}>
          {actions.map((action) => (
            <Grid2 key={action.title} size={6}>
              <Link to={action.route}>
                <PaperCard height="200px" center>
                  {action.title}
                </PaperCard>
              </Link>
            </Grid2>
          ))}
        </Grid2>
      </PaperBackground>
    </PageContainer>
  );
};
