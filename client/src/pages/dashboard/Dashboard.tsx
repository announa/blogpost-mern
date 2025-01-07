import { Box, Card, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/page-header/PageHeader';
import { PageContainer } from '../../components/page-header/page-container/PageContainer';
import { PaperBackground } from '../../components/paper-background/PaperBackground';

const GridContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  alignContent: 'center',
  justifyItems: 'stretch',
  rowGap: '70px',
  columnGap: '70px',
  height: '100%',
});

const Action = styled(Card)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  aspectRatio: '2',
  borderRadius: '20px',
  padding: '18px',
  cursor: 'pointer',
});

export const Dashboard = () => {
  const navigate = useNavigate();
  const actions = [
    { title: 'All Products', url: '/products' },
    { title: 'Add Product', url: '/add-product' },
    { title: 'Update Product', url: '/update-product' },
  ];
  return (
    <PageContainer>
      <PageHeader title="Dashboard" />
      <PaperBackground flex={1}>
        <GridContainer>
          {actions.map((action) => (
            <Action key={action.title} onClick={() => navigate(action.url)}>
              {action.title}
            </Action>
          ))}
        </GridContainer>
      </PaperBackground>
    </PageContainer>
  );
};
