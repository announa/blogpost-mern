import { styled } from '@mui/material';
import { Link as ReactLink, LinkProps as ReactLinkProps } from 'react-router-dom';

export interface LinkProps extends ReactLinkProps {
  fontWeight?: number;
  fontSize?: string;
  color?: string;
  hoverColor?: string;
  visitedColor?: string;
}

export const StyledLink = styled(ReactLink, {
  shouldForwardProp: (prop: string) => !['hoverColor', 'visitedColor'].includes(prop),
})<LinkProps>(({ theme, color, hoverColor, visitedColor, fontSize, fontWeight }) => ({
  color: color ?? 'black',
  fontSize: fontSize ?? '16px',
  fontWeight: fontWeight ?? 400,
  '&:visited': {
    color: visitedColor ?? 'black',
  },
  '&:hover': {
    color: hoverColor ?? theme.palette.primary.main,
  },
}));

export const Link = (props: LinkProps) => {
  const { to, ...restProps } = props;
  return (
    <StyledLink to={to} {...restProps}>
      {props.children}
    </StyledLink>
  );
};
