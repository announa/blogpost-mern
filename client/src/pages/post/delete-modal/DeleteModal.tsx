import { Dialog, DialogContentText, DialogTitle } from '@mui/material';
import { ButtonGroup } from '../../../components/button-group/ButtonGroup';

export interface DeleteModalProps {
  isDeleteModalOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteModal = (props: DeleteModalProps) => {
  const { isDeleteModalOpen, onClose, onConfirm } = props;
  return (
    <Dialog
      open={isDeleteModalOpen}
      onClose={onClose}
      PaperProps={{ sx: { padding: '32px' } }}
    >
      <DialogTitle sx={{ textAlign: 'left', padding: '16px 0' }}>
        Are you sure you want to delete this article?
      </DialogTitle>
      <DialogContentText padding="24px 0">This action can not be undone.</DialogContentText>
      <ButtonGroup
        justifyContent="flex-end"
        confirmButtonText="Delete"
        onConfirm={onConfirm}
        onCancel={onClose}
      />
    </Dialog>
  );
};
