import { styled } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Dashboard } from './pages/dashboard/Dashboard';
import { AddProduct } from './pages/add-product/AddProduct';

const Content = styled('div')({
  height: '100vh',
  width: '100vw',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '50px',
  overflow: 'hidden',
});

export const App = () => {
  return (
    <>
      <Content>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-product" element={<AddProduct />} />
          </Routes>
        </BrowserRouter>
      </Content>
    </>
  );
};

export default App;
