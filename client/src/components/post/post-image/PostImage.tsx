import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { Box, BoxProps, styled } from '@mui/material';
import { ImgHTMLAttributes } from 'react';

export const StyledImage = styled('img')({
  width: '100%',
  aspectRatio: '2',
  objectFit: 'cover',
});

export interface PostImageProps {
  boxProps?: BoxProps;
  imageProps?: ImgHTMLAttributes<HTMLImageElement>;
  src?: string | null;
}
export const PostImage = (props: PostImageProps) => {
  const { boxProps = {}, imageProps, src } = props;
  const {sx, ...restBoxProps} = boxProps
  return (
    <Box
      borderRadius="4px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100%"
      sx={{ aspectRatio: '2', ...sx }}
      position="relative"
      overflow="hidden"
      {...restBoxProps}
    >
      {src ? (
        <StyledImage {...imageProps} src={src} />
      ) : (
        <ImageOutlinedIcon color="disabled" sx={{ fontSize: '80px' }} />
      )}
    </Box>
  );
};
