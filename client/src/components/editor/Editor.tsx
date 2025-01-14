import styled from '@emotion/styled';
import { Dispatch, SetStateAction } from 'react';
import ReactQuill from 'react-quill';
import { PostToEdit } from '../../pages/edit-post/EditPost';

const StyledEditor = styled(ReactQuill)({
  borderRadius: '5px',
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
  // ['link', 'image', 'video', 'formula'],

  // [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  // [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
  [{ direction: 'rtl' }], // text direction

  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ['clean'], // remove formatting button
];

export interface EditorProps {
  setPost: Dispatch<SetStateAction<PostToEdit>>;
  post: PostToEdit;
}
export const Editor = (props: EditorProps) => {
  const { post, setPost } = props;
  return (
    <StyledEditor
      theme="snow"
      value={post.content}
      onChange={(value) => setPost({ ...post, content: value })}
      modules={{ toolbar: toolbarOptions }}
    />
  );
};
