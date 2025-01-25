import { FormEvent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../config/navigation/navigation';
import { errorMessages, postInputParser, useEditPostForm } from '../../../hooks/useEditPostForm';
import { useError } from '../../../hooks/useError';
import { Loading } from '../../loading/Loading';
import { EditPost } from '../component/EditPost';

export const AddPost = () => {
  const navigate = useNavigate();
  const {
    postToUpload,
    setPostToUpload,
    currentImage,
    newImage,
    loading,
    setLoading,
    uploadImage,
    createFormData,
    createPost,
    handleDeleteImage,
  } = useEditPostForm();

  const { error, validateInput, validatedInput } = useError({
    data: postToUpload,
    errorMessages: errorMessages,
    inputParser: postInputParser,
  });

  const isSubmitDisabled = useMemo(() => !validatedInput.success, [postToUpload, validateInput]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const formData = createFormData(!!newImage);
    setLoading(true);
    const postIdResult = await createPost(formData);
    if (postIdResult) {
      navigate(`${routes.post.baseRoute}/${postIdResult}`);
    } else {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading title="Loading..." maxWidth="700px" />;
  }

  return (
    <EditPost
      currentImage={currentImage}
      postToUpload={postToUpload}
      error={error}
      headerText="New Article"
      submitButtonText="Add Article"
      cancelRedirectUrl={routes.posts.route}
      isSubmitDisabled={isSubmitDisabled}
      setPostToUpload={setPostToUpload}
      onChangeImage={uploadImage}
      onDeleteImage={handleDeleteImage}
      validateInput={validateInput}
      onSubmit={onSubmit}
    />
  );
};
