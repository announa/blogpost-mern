import styled from '@emotion/styled';
import { Dispatch, SetStateAction } from 'react';
import ReactQuill from 'react-quill';
import { initialPost, PostToEdit } from '../../hooks/useEditPostForm';

const StyledEditor = styled(ReactQuill)({
  borderRadius: '4px',
  backgroundColor: 'white',
  border: '1px solid #ccc',
  '.ql-toolbar, .ql-container': {
    border: 'none',
  },
  '.ql-toolbar': {
    borderBottom: '1px solid #ccc',
  },
});
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'code-block'],

  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
  [{ direction: 'rtl' }], // text direction

  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ['clean'], // remove formatting button
];

const clipboardOptions = {
  matchVisual: false,
};

export interface EditorProps {
  setPost: Dispatch<SetStateAction<PostToEdit>>;
  content: string;
  onBlur: () => void;
}
export const Editor = (props: EditorProps) => {
  const { content, setPost, onBlur } = props;

  return (
    <StyledEditor
      onBlur={onBlur}
      theme="snow"
      value={content}
      onChange={(newContent) => setPost((prev: typeof initialPost) => ({ ...prev, content: newContent }))}
      modules={{ toolbar: toolbarOptions, clipboard: clipboardOptions }}
    />
  );
};
