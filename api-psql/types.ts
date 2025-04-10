export type Image = {
  id: number;
  name: string;
  content_type: string;
  file: Buffer;
};

export type Post = {
  id: number;
  title: string;
  summary: string;
  content: string;
  author: number;
  image: number | null;
  created_at: string;
};

export type PostgresUser = {
  id: number;
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  password: string;
};

export type ClientUser = {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
};

export type RefreshToken = {
  id: number;
  token: string[];
  user_id: number;
};

export type ResetToken = {
  id: number;
  token: string;
  user_id: number;
  created_at: string;
  updated_at: string;
};
