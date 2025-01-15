import { styled } from '@mui/material'

export const PostInformation = styled('p')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
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
  margin: '24px 0',
  fontSize: '16px',
  fontWeight: 600
})

export const Content = styled('p')({
  p: {
    margin: '5px 0'
  }
})