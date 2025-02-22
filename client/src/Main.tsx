import { styled } from '@mui/material';
import { useEffect, useRef } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingOverlay } from './components/base/loading-overlay/LoadingOverlay';
import { PaperCard } from './components/base/paper-card/PaperCard';
import { NavBar } from './components/nav/NavBar';
import { routes } from './config/navigation/navigation';
import { useUserContext } from './context/useUserContext';
import { useToken } from './hooks/useToken';
import { AccountSettings } from './pages/account-settings/AccountSettings';
import { AddPost } from './pages/edit-post/add-post/AddPost';
import { UpdatePost } from './pages/edit-post/update-post/UpdatePost';
import { Login } from './pages/login/Login';
import { Post } from './pages/post/Post';
import { Posts } from './pages/posts/Posts';
import { Register } from './pages/register/Register';
import { ForgotPassword } from './pages/forgot-password/ForgotPassword';
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
  const userContext = useUserContext();
  const { getAccessToken } = useToken();
  const timeoutId = useRef<NodeJS.Timeout | undefined>(undefined);

  const verifyUserIsLoggedIn = () => {
    clearTimeout(timeoutId.current);
    if (userContext?.refreshTokenExpiration) {
      const newTimeout = userContext?.refreshTokenExpiration - Date.now();
      timeoutId.current = setTimeout(async () => {
        await getAccessToken();
      }, newTimeout);
    }
  };

  useEffect(() => {
    verifyUserIsLoggedIn();
  }, [userContext?.refreshTokenExpiration]);

  return (
    <MainContainer>
      <PaperCard flex={1}>
        <NavBar />
        {userContext?.loading ? (
          <LoadingOverlay open={true} />
        ) : (
          <Routes>
            <Route
              path={routes.addPost.route}
              element={
                userContext?.user ? (
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
            <Route
              path={routes.updatePost.route}
              element={userContext?.user ? <UpdatePost /> : <Navigate to={routes.posts.route} replace />}
            />
            <Route
              path={routes.login.route}
              element={!userContext?.user ? <Login /> : <Navigate to={routes.posts.route} replace />}
            />
            <Route
              path={routes.register.route}
              element={!userContext?.user ? <Register /> : <Navigate to={routes.posts.route} replace />}
            />
            <Route
              path={routes.account.route}
              element={userContext?.user ? <AccountSettings /> : <Navigate to={routes.login.route} replace />}
            />
            <Route path={routes.forgotPassword.route} element={<ForgotPassword />} />
            <Route path={routes.resetPassword.route} element={<ResetPassword />} />
          </Routes>
        )}
      </PaperCard>
    </MainContainer>
  );
};
