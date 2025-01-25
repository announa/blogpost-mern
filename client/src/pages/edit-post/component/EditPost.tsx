import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, styled, TextField, Tooltip } from '@mui/material';
import { ChangeEvent, Dispatch, FormEvent, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/base/button/Button';
import { ErrorMessage } from '../../../components/base/error-message/ErrorMessage';
import { Editor } from '../../../components/editor/Editor';
import { PageContainer } from '../../../components/page/page-container/PageContainer';
import { PageHeader } from '../../../components/page/page-header/PageHeader';
import { PostImage } from '../../../components/post/post-image/PostImage';
import { PostToEdit } from '../../../hooks/useEditPostForm';

const StyledForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  width: '100%',
  [theme.breakpoints.up('md')]: {
    width: '75%',
  },
}));

const DeleteImageButton = styled(IconButton)({
  position: 'absolute',
  top: 10,
  right: 10,
});

export interface EditPostProps {
  postToUpload: PostToEdit;
  currentImage: string | null;
  cancelRedirectUrl: string;
  submitButtonText: string;
  headerText: string;
  onSubmit: (event: FormEvent) => Promise<void>;
  setPostToUpload: Dispatch<SetStateAction<PostToEdit>>;
  isSubmitDisabled: boolean;
  validateInput: (field: 'summary' | 'title' | 'content') => void;
  error: PostToEdit;
  onChangeImage: (event: ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage: () => void;
}

export const EditPost = (props: EditPostProps) => {
  const {
    onSubmit,
    postToUpload,
    currentImage,
    cancelRedirectUrl,
    submitButtonText,
    headerText,
    setPostToUpload,
    isSubmitDisabled,
    validateInput,
    error,
    onChangeImage,
    onDeleteImage,
  } = props;

  const navigate = useNavigate();

  return (
    <PageContainer>
      <PageHeader title={headerText} />

      <StyledForm onSubmit={onSubmit}>
        <div>
          <TextField
            name="title"
            label="Title"
            value={postToUpload.title}
            type="text"
            required
            fullWidth
            onBlur={() => validateInput('title')}
            onChange={(event) => setPostToUpload({ ...postToUpload, title: event.target.value })}
            sx={{ '.MuiInputBase-root': { backgroundColor: 'white' } }}
          />
          {error.title && <ErrorMessage>{error.title}</ErrorMessage>}
        </div>
        <div>
          <TextField
            label="Summary"
            multiline
            maxRows={3}
            required
            fullWidth
            value={postToUpload.summary}
            type="text"
            onBlur={() => validateInput('summary')}
            onChange={(event) => setPostToUpload({ ...postToUpload, summary: event.target.value })}
            sx={{ '.MuiInputBase-root': { backgroundColor: 'white' } }}
          />
          {error.summary && <ErrorMessage>{error.summary}</ErrorMessage>}
        </div>
        <div>
          <Editor
            onBlur={() => validateInput('content')}
            content={postToUpload.content}
            setPost={setPostToUpload}
          />
          {error.content && <ErrorMessage>{error.content}</ErrorMessage>}
        </div>
        <input type="file" onChange={onChangeImage} />
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="100%"
          sx={{ aspectRatio: '2' }}
          position="relative"
          border={currentImage ? 'none' : '1px solid #cdcdcd'}
          borderRadius="4px"
        >
          <Box flex={1}>
            <PostImage src={currentImage} />
            {currentImage && (
              <Tooltip title="Delete Image">
                <DeleteImageButton
                  size="small"
                  sx={{
                    backgroundColor: 'white',
                    '&:hover': { backgroundColor: 'white', boxShadow: '0 0 4px white' },
                  }}
                  onClick={onDeleteImage}
                >
                  <DeleteIcon />
                </DeleteImageButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between" gap="24px">
          <Button variant="outlined" onClick={() => navigate(cancelRedirectUrl)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitDisabled}>
            {submitButtonText}
          </Button>
        </Box>
      </StyledForm>
    </PageContainer>
  );
};
