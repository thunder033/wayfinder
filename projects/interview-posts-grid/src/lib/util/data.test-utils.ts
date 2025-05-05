import { Post } from '../types/posts-grid';

export const TEST_POST = ({ id = 0, ...values }: Partial<Post> = {}): Post => ({
  userId: 2,
  id,
  title: `test-title-${id}`,
  body: `test-body-${id}`,
  ...values,
});
