import { Route, Routes } from 'react-router-dom';
import { lazyImport } from '../../../utils/lazy-import.ts';

const { Post } = lazyImport(() => import('../components/post.tsx'), 'Post');
const { Posts } = lazyImport(() => import('../components/posts.tsx'), 'Posts');

export function BlogRouter() {
  return (
    <Routes>
      <Route path="" element={<Posts />} />
      <Route path="post/:postId" element={<Post />}></Route>
    </Routes>
  )
}
