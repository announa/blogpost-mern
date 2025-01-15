import { styled, TextField } from '@mui/material';
import { useState } from 'react';
import { PageContainer } from '../../components/page-container/PageContainer';
import { PageHeader } from '../../components/page-header/PageHeader';
import { PaperCard } from '../../components/paper-card/PaperCard';
import { Button } from '../../components/button/Button';

const StyledForm = styled('form')({
  width: '100%',
  maxWidth: '500px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const initialUserData = {
  email: '',
  password: '',
};

export const Login = () => {
  const [userData, setUserData] = useState(initialUserData);

  const handleLogin = () => {}
  
  return (
    <PageContainer>
      <PageHeader title="Login" />
      <PaperCard maxWidth="500px" padding="50px">
        <StyledForm>
          <TextField
            name="email"
            label="E-Mail"
            type="email"
            value={userData.email}
            onChange={(event) => setUserData({ ...userData, email: event.target.value })}
          />
          <TextField
            name="password"
            label="Enter Password"
            type="password"
            value={userData.password}
            onChange={(event) => setUserData({ ...userData, password: event.target.value })}
          />
          <Button onClick={handleLogin}>Login</Button>
        </StyledForm>
      </PaperCard>
    </PageContainer>
  );
};
