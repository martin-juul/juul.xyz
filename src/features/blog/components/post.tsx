import Markdown from 'react-markdown'
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchText } from '../../../utils/fetch.ts';
import styles from './post.module.css'

export function Post() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [markdown, setMarkdown] = useState<string | null>(null);

  if (!postId) {
    navigate('/not-found');
    return;
  }

  useEffect(() => {
    fetchText(`/assets/blog/entries/${postId}.md`)
      .then(setMarkdown)
      .catch(() => navigate('/not-found'));
  }, [postId])

  return (
    <div className={styles.post}>
      { markdown && <Markdown>{markdown}</Markdown>}
    </div>
  )
}
