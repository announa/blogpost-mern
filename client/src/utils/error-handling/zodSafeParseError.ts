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
