import { Box, BoxProps, CircularProgress, Modal, ModalProps } from '@mui/material';

export interface LoadingOverlayProps {
  open: boolean;
  modalProps?: ModalProps;
  BoxProps?: BoxProps;
}
export const LoadingOverlay = ({ open, modalProps, BoxProps }: LoadingOverlayProps) => {
  return (
    <Modal {...modalProps} open={open}>
      <Box height="100%" display="flex" justifyContent="center" alignItems="center" {...BoxProps}>
        <CircularProgress sx={{ color: 'lightblue' }} />
      </Box>
    </Modal>
  );
};
