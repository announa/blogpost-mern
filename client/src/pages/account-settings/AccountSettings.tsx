import EditIcon from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';
import axios from 'axios';
import { isEqual } from 'lodash';
import { useSnackbar } from 'notistack';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import validator from 'validator';
import { z } from 'zod';
import { PageContainer } from '../../components/page/page-container/PageContainer';
import { PageHeader } from '../../components/page/page-header/PageHeader';
import { useUserContext } from '../../context/useUserContext';
import { useError } from '../../hooks/useError';
import { useToken } from '../../hooks/useToken';
import { handleError } from '../../utils/errorHandling';
import { UserData, UserForm } from './form/UserForm';
import { initialUserData, PASSWORD_REGEX, userErrorMessages } from './form/utils';

const userInputParser = z
  .object({
    firstName: z.string().nonempty({ message: userErrorMessages.firstName }),
    lastName: z.string().nonempty({ message: userErrorMessages.lastName }),
    userName: z.string().nonempty({ message: userErrorMessages.userName }),
    email: z.string().refine((value) => validator.isEmail(value), { message: userErrorMessages.email }),
    password: z
      .string()
      .refine((password) => (password ? PASSWORD_REGEX.test(password) : true), userErrorMessages.password),
    repeatPassword: z.string(),
  })
  .superRefine((input, ctx) => {
    if (input.password !== input.repeatPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['repeatPassword'],
        message: userErrorMessages.repeatPassword,
      });
    }
  });

export const AccountSettings = () => {
  const userContext = useUserContext();
  const { enqueueSnackbar } = useSnackbar();
  const { getAccessToken } = useToken();
  const [userData, setUserData] = useState(initialUserData);
  const [editMode, setEditMode] = useState(false);
  const { error, validateInput, validatedInput } = useError({
    data: userData,
    errorMessages: userErrorMessages,
    inputParser: userInputParser,
  });

  useEffect(() => {
    if (userContext?.user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...userData } = userContext.user;
      setUserData({ ...userData, password: '', repeatPassword: '' });
    }
  }, [userContext]);

  const isSubmitDisabled = useMemo(() => {
    if (userContext?.user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...user } = { ...userContext.user, password: '', repeatPassword: '' };
      return !validatedInput.success || isEqual(user, userData);
    } else {
      return true;
    }
  }, [validatedInput, userContext, userData]);

  const createFormData = () => {
    const formData = new FormData();
    if (userContext?.user) {
      for (const key in userData) {
        const userDataKey = key as keyof UserData;
        if (
          userDataKey !== 'password' &&
          userDataKey !== 'repeatPassword' &&
          userData[userDataKey] !== userContext?.user[userDataKey]
        ) {
          formData.append(userDataKey, String(userData[userDataKey]));
        }
        if (userDataKey === 'password' && userData[userDataKey] !== '') {
          formData.append(userDataKey, String(userData[userDataKey]));
        }
      }
      return formData;
    }
    return null;
  };

  const handleUpdateUser = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const accessToken = await getAccessToken();
      const formData = createFormData();
      if (!formData) {
        handleError(new Error('Nothing to update'), enqueueSnackbar);
        return;
      }
      const result = await axios.put(`${import.meta.env.VITE_USER_URL}/${userContext?.user?.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      enqueueSnackbar('User data successfully updated', { variant: 'success', autoHideDuration: 3000 });
      setEditMode(false);
      userContext?.setUser(result.data);
    } catch (error: unknown) {
      handleError(error, enqueueSnackbar);
    }
  };

  const EditFormButton = (
    <IconButton sx={{ '&:focus': { outline: 'none' } }} onClick={() => setEditMode(!editMode)}>
      <EditIcon />
    </IconButton>
  );

  return (
    <PageContainer>
      <PageHeader title="Account Settings" customElement={EditFormButton} />
      <UserForm
        userData={userData}
        setUserData={setUserData}
        error={error}
        validateInput={validateInput}
        validatedInput={validatedInput}
        editMode={editMode}
        onSubmit={handleUpdateUser}
        buttonGroupProps={{
          submitButtonText: 'Update User Data',
          onCancelAction: () => setEditMode(false),
          isSubmitDisabled,
          alignItems: 'flex-end',
          marginTop: '32px',
        }}
      />
    </PageContainer>
  );
};
