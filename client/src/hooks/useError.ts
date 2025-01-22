import { useEffect, useMemo, useState } from 'react';
import { z, ZodRawShape } from 'zod';
import { handleZodSafeParseError } from '../utils/errorHandling';

export interface UseErrorProps<T extends Record<string, string>, U extends ZodRawShape> {
  data: z.infer<z.ZodObject<U>>;
  errorMessages: T;
  inputParser: z.ZodEffects<z.ZodObject<U>> | z.ZodObject<U>;
}

export const useError = <T extends Record<string, string>, U extends ZodRawShape>({
  data,
  errorMessages,
  inputParser,
}: UseErrorProps<T, U>) => {
  const initialError = useMemo(() => {
    const errors = Object.entries(errorMessages);
    const emptyErrors = errors.map((error) => [error[0], '']);
    const initialMessages = Object.fromEntries(emptyErrors);
    return initialMessages;
  }, [errorMessages]);

  const [error, setError] = useState(initialError);

  const validatedInput = useMemo(() => {
    const validatedInput = inputParser.safeParse(data);
    return validatedInput;
  }, [data]);

  useEffect(() => {
    const newError = handleZodSafeParseError(error, validatedInput);
    setError(newError);
  }, [validatedInput]);

  const validateInput = (field: keyof T) => {
    const hasError = validatedInput.error?.issues.find((issue) => issue.path[0] === field);
    if (hasError) {
      setError({ ...error, [field]: errorMessages[field] });
    }
  };
  return {
    error,
    setError,
    initialError,
    validateInput,
    validatedInput
  };
};
