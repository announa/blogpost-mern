export const routes = {
  // dashboard: { name: 'Dashboard', baseRoute: '/', route: '/' },
  posts: { name: 'Overview', baseRoute: '/', route: '/' },
  addPost: { name: 'Write an Article', baseRoute: '/add-post', route: '/add-post' },
  post: { name: 'Article', baseRoute: '/post', route: '/post/:id' },
  updatePost: { name: 'Edit Article', baseRoute: '/update-post', route: '/update-post/:id' },
  login: { name: 'Login', baseRoute: '/login', route: '/login' },
  register: { name: 'Register', baseRoute: '/register', route: '/register' },
};

export const sidebarRoutes = [routes.posts, routes.addPost];
