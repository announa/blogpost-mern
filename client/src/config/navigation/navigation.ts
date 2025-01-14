export const routes = {
  dashboard: { name: 'Dashboard', baseRoute: '/', route: '/' },
  addPost: { name: 'Add Post', baseRoute: '/add-post', route: '/add-post' },
  posts: { name: 'Posts', baseRoute: '/posts', route: '/posts' },
  post: { name: 'Post', baseRoute: '/posts', route: '/posts/:id' },
  updatePost: { name: 'Update', baseRoute: '/update-post', route: '/update-post/:id' },
};

export const sidebarRoutes = [routes.dashboard, routes.addPost, routes.posts];
