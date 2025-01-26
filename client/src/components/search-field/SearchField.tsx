import SearchIcon from '@mui/icons-material/Search';
import { OutlinedInput, OutlinedInputProps } from '@mui/material';
import { ChangeEvent, Dispatch, SetStateAction, useRef } from 'react';

export interface SearchFieldProps<T extends Record<string, string>> extends OutlinedInputProps {
  search: T;
  setSearch: Dispatch<SetStateAction<T>>;
}
export const SearchField = <T extends Record<string, string>>({
  search,
  setSearch,
  ...inputProps
}: SearchFieldProps<T>) => {
  const name = inputProps.name as keyof T;
  const timeout = useRef<number | null>(null);

  const debounceOnChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => setSearch({ ...search, [name]: event.target.value }), 300);
  };

  return (
    <OutlinedInput
      onChange={debounceOnChange}
      placeholder={inputProps.placeholder}
      endAdornment={<SearchIcon />}
    />
  );
};
