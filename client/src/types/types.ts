export type Post = {
  id: string;
  title: string;
  author: string;
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
