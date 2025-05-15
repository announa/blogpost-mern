import { Box, Grid2, TextField, Typography } from '@mui/material';
import { Dispatch, FormEvent, SetStateAction, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { z } from 'zod';
import { ErrorMessage } from '../../../components/base/error-message/ErrorMessage';
import { FormContainer } from '../../../components/base/form-container/FormContainer';
import { ButtonGroup, ButtonGroupProps } from '../../../components/button-group/ButtonGroup';
import { routes } from '../../../config/navigation/navigation';
import { initialUserData, UserErrorMessages } from './utils';
import { useAuthContext } from '../../../context/useAuthContext';

export type UserData = {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  repeatPassword: string;
};

export interface UserFormProps {
  userData: UserData;
  setUserData: Dispatch<SetStateAction<UserData>>;
  error: UserErrorMessages;
  editMode?: boolean;
  validateInput: (field: keyof UserErrorMessages) => void;
  validatedInput: z.SafeParseReturnType<UserData, UserData>;
  onSubmit: (event: FormEvent, userData: UserData) => void;
  buttonGroupProps: ButtonGroupProps;
  fullWidth?: boolean;
}

export const UserForm = ({
  userData,
  setUserData,
  error,
  validateInput,
  validatedInput,
  onSubmit,
  editMode = true,
  buttonGroupProps,
  fullWidth = false,
}: UserFormProps) => {
  const { pathname } = useLocation();
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...userData } = user;
      setUserData({ ...userData, password: '', repeatPassword: '' });
    } else {
      setUserData(initialUserData);
    }
  }, [user]);

  const isSubmitDisabled = useMemo(() => !validatedInput.success, [validatedInput, userData]);

  return (
    <FormContainer
      maxWidth={pathname === routes.register.route ? '500px' : undefined}
      onSubmit={(event) => onSubmit(event, userData)}
    >
      <Grid2 container spacing={4}>
        <Grid2 size={{ xs: 12, sm: fullWidth ? 12 : 6 }}>
          <TextField
            name="firstName"
            label="First Name"
            type="text"
            required
            disabled={!editMode}
            fullWidth
            value={userData.firstName}
            onBlur={() => validateInput('firstName')}
            onChange={(event) => setUserData({ ...userData, firstName: event.target.value })}
            slotProps={{ input: { sx: { background: 'white' } } }}
            error={!!error.firstName}
          />
          {error.firstName && <ErrorMessage>{error.firstName}</ErrorMessage>}
        </Grid2>
        <Grid2 size={{ xs: 12, sm: fullWidth ? 12 : 6 }}>
          <TextField
            name="lastName"
            label="Last Name"
            type="text"
            required
            disabled={!editMode}
            fullWidth
            value={userData.lastName}
            onBlur={() => validateInput('lastName')}
            onChange={(event) => setUserData({ ...userData, lastName: event.target.value })}
            slotProps={{ input: { sx: { background: 'white' } } }}
            error={!!error.lastName}
          />
          {error.lastName && <ErrorMessage>{error.lastName}</ErrorMessage>}
        </Grid2>
        <Grid2 size={{ xs: 12, sm: fullWidth ? 12 : 6 }}>
          <TextField
            name="userName"
            label="User Name"
            type="text"
            required
            disabled={!editMode}
            fullWidth
            onBlur={() => validateInput('userName')}
            value={userData.userName}
            onChange={(event) => setUserData({ ...userData, userName: event.target.value })}
            slotProps={{ input: { sx: { background: 'white' } } }}
            error={!!error.userName}
          />
          {error.userName && <ErrorMessage>{error.userName}</ErrorMessage>}
        </Grid2>
        <Grid2 size={{ xs: 12, sm: fullWidth ? 12 : 6 }}>
          <TextField
            name="email"
            label="E-Mail"
            type="email"
            required
            disabled={!editMode}
            fullWidth
            onBlur={() => validateInput('email')}
            value={userData.email}
            onChange={(event) => setUserData({ ...userData, email: event.target.value })}
            slotProps={{ input: { sx: { background: 'white' } } }}
            error={!!error.email}
          />
          {error.email && <ErrorMessage>{error.email}</ErrorMessage>}
        </Grid2>
        {pathname !== routes.register.route && (
          <Box width="100%" marginTop="24px">
            <Typography>Change Password:</Typography>
          </Box>
        )}
        <Grid2 size={{ xs: 12, sm: fullWidth ? 12 : 6 }}>
          <TextField
            name="password"
            label="Enter Password"
            type="password"
            required={!editMode}
            disabled={!editMode}
            fullWidth
            onBlur={() => {
              validateInput('password');
              if (userData.repeatPassword) validateInput('repeatPassword');
            }}
            value={userData.password}
            onChange={(event) => setUserData({ ...userData, password: event.target.value })}
            slotProps={{ input: { sx: { background: 'white' } } }}
            error={!!error.password}
          />
          {error.password && <ErrorMessage>{error.password}</ErrorMessage>}
        </Grid2>
        <Grid2 size={{ xs: 12, sm: fullWidth ? 12 : 6 }}>
          <TextField
            name="repeatPassword"
            label="Repeat Password"
            type="password"
            required={!editMode}
            disabled={!editMode}
            fullWidth
            onBlur={() => validateInput('repeatPassword')}
            value={userData.repeatPassword}
            onChange={(event) => setUserData({ ...userData, repeatPassword: event.target.value })}
            slotProps={{ input: { sx: { background: 'white' } } }}
            error={!!error.repeatPassword}
          />
          {error.repeatPassword && <ErrorMessage>{error.repeatPassword}</ErrorMessage>}
        </Grid2>
      </Grid2>
      <ButtonGroup
        {...buttonGroupProps}
        isConfirmDisabled={buttonGroupProps.isConfirmDisabled ?? isSubmitDisabled}
      />
    </FormContainer>
  );
};
