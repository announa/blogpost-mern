import { Login } from '@mui/icons-material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { NavBar } from './components/nav/NavBar';
import { PageContainer } from './components/page-container/PageContainer';
import { PaperBackground } from './components/paper-background/PaperBackground';
import { routes } from './config/navigation/navigation';
import { useUserContext } from './context/UserContext';
import { EditPost } from './pages/edit-post/EditPost';
import { Post } from './pages/post/Post';
import { Posts } from './pages/posts/Posts';
import { Register } from './pages/register/Register';

export const Main = () => {
  const userContext = useUserContext();
  return (
    <PageContainer>
      <PaperBackground flex={1}>
        <NavBar />
        <Routes>
          <Route
            path={routes.addPost.route}
            element={userContext?.user ? <EditPost /> : <Navigate to={routes.posts.route} replace />}
          />
          <Route path={routes.posts.route} element={<Posts />} />
          <Route path={routes.post.route} element={<Post />} />
          <Route
            path={routes.updatePost.route}
            element={userContext?.user ? <EditPost /> : <Navigate to={routes.posts.route} replace />}
          />
          <Route
            path={routes.login.route}
            element={!userContext?.user ? <Login /> : <Navigate to={routes.posts.route} replace />}
          />
          <Route
            path={routes.register.route}
            element={!userContext?.user ? <Register /> : <Navigate to={routes.posts.route} replace />}
          />
        </Routes>
      </PaperBackground>
    </PageContainer>
  );
};
