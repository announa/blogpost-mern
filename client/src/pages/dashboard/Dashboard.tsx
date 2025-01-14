import { Grid2 } from '@mui/material';
import { PageContainer } from '../../components/page-container/PageContainer';
import { PageHeader } from '../../components/page-header/PageHeader';
import { PaperBackground } from '../../components/paper-background/PaperBackground';
import { PaperCard } from '../../components/paper-card/PaperCard';
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
              <a href={action.route}>
                <PaperCard height="200px" center>
                  {action.title}
                </PaperCard>
              </a>
            </Grid2>
          ))}
        </Grid2>
      </PaperBackground>
    </PageContainer>
  );
};
