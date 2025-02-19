import SearchIcon from '@mui/icons-material/Search';
import { TextField, TextFieldProps } from '@mui/material';
import { ChangeEvent, Dispatch, SetStateAction, useRef } from 'react';

export interface SearchFieldProps<T extends Record<string, string>> extends TextFieldProps<'outlined'> {
  search: T;
  setSearch: Dispatch<SetStateAction<T>>;
}
export const SearchField = <T extends Record<string, string>>({
  search,
  setSearch,
  ...textFieldProps
}: SearchFieldProps<T>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const name = textFieldProps.name as keyof T;
  const timeout = useRef<NodeJS.Timeout | null>(null);

  const debounceOnChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => setSearch({ ...search, [name]: event.target.value }), 300);
  };

  return (
    <TextField
      inputRef={inputRef}
      variant={textFieldProps.variant}
      onChange={debounceOnChange}
      placeholder={textFieldProps.placeholder}
      slotProps={{
        input: {
          endAdornment: <SearchIcon />,
          sx: { fontSize: '14px' },
        },
      }}
      hidden
      size="small"
      sx={{ flex: 1, maxWidth: '250px' }}
    />
  );
};
