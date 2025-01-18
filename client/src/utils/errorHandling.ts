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

export const handleAxiosError = (
  error: unknown,
  enqueueSnackbar: EnqueueSnackbar,
  customMessage?: string
) => {
  const axiosError = error as AxiosError;
  console.error(axiosError);
  const errorData = axiosError?.response?.data as { message: string };
  enqueueSnackbar(customMessage ?? errorData.message, { variant: 'error', autoHideDuration: 3000 });
};

export const handleNormalError = (
  error: unknown,
  enqueueSnackbar: EnqueueSnackbar,
  customMessage?: string
) => {
  const normalError = error as Error;
  console.error(normalError);
  enqueueSnackbar(customMessage ?? normalError.message, { variant: 'error', autoHideDuration: 3000 });
};
