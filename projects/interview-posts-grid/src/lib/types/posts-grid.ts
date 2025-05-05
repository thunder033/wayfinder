export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export type GetPostsResponse = Post[];

export interface PostsGridFeatureState {
  allPosts: Record<string, Post>;
  currentPostId: number | null;
}

export interface AppState {
  postsGrid: PostsGridFeatureState;
}
