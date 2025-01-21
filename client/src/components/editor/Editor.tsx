import styled from '@emotion/styled';
import { Dispatch, SetStateAction, useState } from 'react';
import ReactQuill from 'react-quill';
import { PostToEdit } from '../../pages/edit-post/EditPost';

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
  post: PostToEdit;
}
export const Editor = (props: EditorProps) => {
  const { post, setPost } = props;
  const [editorContent, setEditorContent] = useState<string | null>(null);
  const handleChange = (content: string) => {
    if (!editorContent) {
      setEditorContent(post.content);
      setPost({ ...post, content: content });
    } else {
      setPost({ ...post, content: content });
    }
  };

  return (
    <StyledEditor
      theme="snow"
      value={post.content}
      onChange={handleChange}
      modules={{ toolbar: toolbarOptions, clipboard: clipboardOptions }}
    />
  );
};
