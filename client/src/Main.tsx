import { styled } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingOverlay } from './components/base/loading-overlay/LoadingOverlay';
import { PaperCard } from './components/base/paper-card/PaperCard';
import { NavBar } from './components/nav/NavBar';
import { routes } from './config/navigation/navigation';
import { useAuthContext } from './context/useAuthContext';
import { AccountSettings } from './pages/account-settings/AccountSettings';
import { AddPost } from './pages/edit-post/add-post/AddPost';
import { UpdatePost } from './pages/edit-post/update-post/UpdatePost';
import { ForgotPassword } from './pages/forgot-password/ForgotPassword';
import { Login } from './pages/login/Login';
import { Post } from './pages/post/Post';
import { Posts } from './pages/posts/Posts';
import { Register } from './pages/register/Register';
import { ResetPassword } from './pages/reset-password/ResetPassword';

const MainContainer = styled('div')({
  height: '100vh',
  width: '100vw',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '36px',
  position: 'relative',
  padding: '10px',
  backgroundColor: '#efefef',
  ['@media (min-width: 1400px)']: {
    padding: '10px 10vw',
  },
});

export const Main = () => {
  const { user, loading } = useAuthContext();

  return (
    <MainContainer>
      <PaperCard flex={1}>
        <NavBar />
        {loading ? (
          <LoadingOverlay open={true} />
        ) : (
          <Routes>
            <Route
              path={routes.addPost.route}
              element={
                user ? (
                  <AddPost />
                ) : (
                  <Navigate to={routes.login.route} state={{ lastVisited: routes.addPost.route }} replace />
                )
              }
            />
            <Route
              path={routes.updatePost.baseRoute}
              element={<Navigate to={routes.addPost.route} replace />}
            />
            <Route path={routes.posts.route} element={<Posts />} />
            <Route path={routes.post.route} element={<Post />} />
            <Route path={routes.post.baseRoute} element={<Navigate to={routes.posts.route} />} />
            <Route
              path={routes.updatePost.route}
              element={user ? <UpdatePost /> : <Navigate to={routes.posts.route} replace />}
            />
            <Route
              path={routes.login.route}
              element={!user ? <Login /> : <Navigate to={routes.posts.route} replace />}
            />
            <Route
              path={routes.register.route}
              element={!user ? <Register /> : <Navigate to={routes.posts.route} replace />}
            />
            <Route
              path={routes.account.route}
              element={user ? <AccountSettings /> : <Navigate to={routes.login.route} replace />}
            />
            <Route path={routes.forgotPassword.route} element={<ForgotPassword />} />
            <Route path={routes.resetPassword.route} element={<ResetPassword />} />
          </Routes>
        )}
      </PaperCard>
    </MainContainer>
  );
};
