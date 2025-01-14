import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { Box, BoxProps, styled } from '@mui/material';
import { ImgHTMLAttributes } from 'react';

export const StyledImage = styled('img')({
  width: '100%',
  borderRadius: '15px',
  aspectRatio: '2',
  objectFit: 'cover',
});

export interface PostImageProps {
  boxProps?: BoxProps;
  imageProps?: ImgHTMLAttributes<HTMLImageElement>;
  src?: string | null;
}
export const PostImage = (props: PostImageProps) => {
  const { boxProps, imageProps, src } = props;
  return (
    <Box
      {...boxProps}
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100%"
      sx={{ aspectRatio: '2' }}
      position="relative"
    >
      {src ? (
        <StyledImage {...imageProps} src={src} />
      ) : (
        <ImageOutlinedIcon color="disabled" sx={{ fontSize: '80px' }} />
      )}
    </Box>
  );
};
