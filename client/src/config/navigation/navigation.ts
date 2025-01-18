export const routes = {
  // dashboard: { name: 'Dashboard', baseRoute: '/', route: '/' },
  posts: { name: 'Posts', baseRoute: '/', route: '/' },
  addPost: { name: 'Add Post', baseRoute: '/edit-post', route: '/edit-post' },
  post: { name: 'Post', baseRoute: '/post', route: '/post/:id' },
  updatePost: { name: 'Update', baseRoute: '/update-post', route: '/update-post/:id' },
  login: { name: 'Login', baseRoute: '/login', route: '/login' },
  register: { name: 'Register', baseRoute: '/register', route: '/register' },
};

export const sidebarRoutes = [routes.posts, routes.addPost];
