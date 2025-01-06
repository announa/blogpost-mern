import { Card, Paper, styled } from '@mui/material';

const ActionsContainer = styled(Paper)({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  rowGap: '50px',
  columnGap: '50px',
  padding: '50px',
  width: '80vw',
  height: '80%',
  background: '#f5f5f5',
})
const Action = styled(Card)({
  height: '200px',
  width: '300px',
  borderRadius: '20px',
  padding: '18px'
})

export const Dashboard = () => {
  return (
    <ActionsContainer>
      <Action>Add Product</Action>
      <Action>Update Product</Action>
    </ActionsContainer>
  );
};
