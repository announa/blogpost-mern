export const routes = {
  dashboard: { name: 'Dashboard', baseRoute: '/', route: '/' },
  addPost: { name: 'Add Post', baseRoute: '/edit-post', route: '/edit-post' },
  posts: { name: 'Posts', baseRoute: '/posts', route: '/posts' },
  post: { name: 'Post', baseRoute: '/posts', route: '/posts/:id' },
  updatePost: { name: 'Update', baseRoute: '/update-post', route: '/update-post/:id' },
  login: { name: 'Login', baseRoute: '/login', route: '/login' },
  register: { name: 'Register', baseRoute: '/register', route: '/register' },
};

export const sidebarRoutes = [routes.dashboard, routes.addPost, routes.posts];
