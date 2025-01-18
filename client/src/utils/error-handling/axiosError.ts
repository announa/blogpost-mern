import { AxiosError } from "axios";
import { EnqueueSnackbar } from "notistack";

export const handleAxiosError = (error: unknown, enqueueSnackbar: EnqueueSnackbar, customMessage?: string) => {
  const axiosError = error as AxiosError;
  console.error(axiosError);
  const errorData = axiosError?.response?.data as {message: string}
  enqueueSnackbar(customMessage ?? errorData.message, { variant: 'error' });
}