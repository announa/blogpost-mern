export type Image = {
  id: string;
  name: string;
  contentType: string;
  file: Buffer;
  post: string;
};

export type Post = {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  image: string | null;
};

export type User = {
  id: string
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  password: string;
};
