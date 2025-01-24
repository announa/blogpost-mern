export type Author = {
  id: string;
  userName: string;
};

export type Post = {
  id: string;
  title: string;
  author: Author;
  summary: string;
  content: string;
  createdAt: string;
  image: {
    id: string;
    name: string;
    file: Buffer;
    contentType: string;
    data: string;
  } | null;
};
