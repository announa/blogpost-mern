import { styled } from '@mui/material'

export const PostInformation = styled('p')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
})

export const Title = styled('p')({
  fontSize: '16px',
  fontWeight: 500,
  marginTop: '24px',
  marginBottom: '4px',
})

export const Author = styled('p')({
  fontSize: '14px',
  margin: 0
})

export const Date = styled('p')({
  fontSize: '12px',
  fontWeight: 700,
  color: '#777777',
  margin: 0
})

export const Summary = styled('p')({
  margin: '18px 0',
  fontSize: '14px',
  fontWeight: 600,
  display: '-webkit-box',
  'WebkitLineClamp': '4',
  'WebkitBoxOrient': 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
})

export const Content = styled('p')({
  p: {
    margin: '5px 0'
  }
})