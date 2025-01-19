import { AxiosError } from 'axios';
import { EnqueueSnackbar } from 'notistack';
import { z } from 'zod';

export const handleZodSafeParseError = <T extends Record<string, string>>(
  error: T,
  zodSafeParseReturnValue: z.SafeParseReturnType<T, T>
) => {
  const allErrorFields = Object.keys(error);
  const activeErrorFields = zodSafeParseReturnValue.error?.issues.map((issue) => issue.path[0]);
  const noErrorFields = allErrorFields.filter((field) => !activeErrorFields?.includes(field));
  let newError = { ...error };
  for (const key of noErrorFields) {
    newError = { ...newError, [key]: '' };
  }
  return newError;
};

export const handleError = (
  error: unknown,
  enqueueSnackbar: EnqueueSnackbar,
  customMessage?: string
) => {
  let errorMessage = '';
  if (error instanceof AxiosError) {
    const errorData = error?.response?.data as { error: { message: string } };
    errorMessage = errorData.error.message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  console.error(errorMessage);
  enqueueSnackbar(customMessage ?? errorMessage, { variant: 'error', autoHideDuration: 3000 });
};
