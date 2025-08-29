import styles from './posts.module.css'
import { Link } from 'react-router-dom';

interface BlogPostProps {
  title: string;
  summary: string;
  date: string;
  path: string;
}
function BlogPost({ title, summary, date, path}: BlogPostProps) {
  return (
    <Link to={path}>
      <div>
        <div className={styles.headline}>
          <h2>{title}</h2>
          <span>{date}</span>
        </div>
        <p className={styles.summary}>{summary}</p>
      </div>
    </Link>
  )
}

export function Posts() {
  return (
    <>
      <h1 className={styles.title}>Blog posts</h1>

      <BlogPost
        title="Dozzle"
        path="post/2025_03_13_dozzle"
        summary="Dozzle is a lightweight, open source, self-hosted, log viewer for Docker containers."
        date="2025-03-13"
      />
    </>
  )
}
