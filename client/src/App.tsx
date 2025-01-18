import { styled, ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/sidebar/Sidebar';
import { routes } from './config/navigation/navigation';
import { Dashboard } from './pages/dashboard/Dashboard';
import { EditPost } from './pages/edit-post/EditPost';
import { Post } from './pages/post/Post';
import { Posts } from './pages/posts/Posts';
import { theme } from './style/theme';
import { Register } from './pages/register/Register';
import { Login } from './pages/login/Login';
import { UserContextProvider } from './context/UserContext';

const Content = styled('div')({
  height: '100vh',
  width: '100vw',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '24px',
  padding: '10px',
  overflow: 'hidden',
  backgroundColor: '#efefef',
});

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <UserContextProvider>
        <SnackbarProvider>
          <Content>
            <BrowserRouter>
              <Sidebar />
              <Routes>
                <Route path={routes.dashboard.route} element={<Dashboard />} />
                <Route path={routes.addPost.route} element={<EditPost />} />
                <Route path={routes.posts.route} element={<Posts />} />
                <Route path={routes.post.route} element={<Post />} />
                <Route path={routes.updatePost.route} element={<EditPost />} />
                <Route path={routes.login.route} element={<Login />} />
                <Route path={routes.register.route} element={<Register />} />
              </Routes>
            </BrowserRouter>
          </Content>
        </SnackbarProvider>
      </UserContextProvider>
    </ThemeProvider>
  );
};

export default App;
