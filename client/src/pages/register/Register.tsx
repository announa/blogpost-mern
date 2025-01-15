import { styled, TextField } from '@mui/material';
import { useState } from 'react';
import { Button } from '../../components/button/Button';
import { PageContainer } from '../../components/page-container/PageContainer';
import { PageHeader } from '../../components/page-header/PageHeader';
import { PaperCard } from '../../components/paper-card/PaperCard';

const StyledForm = styled('form')({
  width: '100%',
  maxWidth: '500px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

const initialUserData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
};

export const Register = () => {
  const [userData, setUserData] = useState(initialUserData);
  const [repeatPassword, setRepeatPassword] = useState('');
  return (
    <PageContainer>
      <PageHeader title="Register" />
      <PaperCard maxWidth="500px" padding="50px">
        <StyledForm>
          <TextField
            name="firstName"
            label="First Name"
            type="text"
            value={userData.firstName}
            onChange={(event) => setUserData({ ...userData, firstName: event.target.value })}
          />
          <TextField
            name="lastName"
            label="Last Name"
            type="text"
            value={userData.lastName}
            onChange={(event) => setUserData({ ...userData, lastName: event.target.value })}
          />
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
          <TextField
            name="repeat-password"
            label="Repeat Password"
            type="password"
            value={repeatPassword}
            onChange={(event) => setRepeatPassword(event.target.value)}
          />
          <Button>Register</Button>
        </StyledForm>
      </PaperCard>
    </PageContainer>
  );
};
