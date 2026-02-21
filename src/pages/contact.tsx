import { useState } from 'preact/hooks';
import { useLanguage } from '../context/language-context';

export function Contact() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError(t.contact.error);
      return;
    }
    setError('');
    alert('Message sent!');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div style="padding: 16px;">
      <h1>{t.contact.title}</h1>
      <p>{t.contact.getInTouch}</p>

      <form onSubmit={handleSubmit} style="margin-top: 20px;">
        <div class="field-row-stacked" style="margin-bottom: 12px;">
          <label for="name">{t.contact.name}</label>
          <input
            id="name"
            type="text"
            value={name}
            onInput={(e) => setName((e.target as HTMLInputElement).value)}
          />
        </div>

        <div class="field-row-stacked" style="margin-bottom: 12px;">
          <label for="email">{t.contact.email}</label>
          <input
            id="email"
            type="email"
            value={email}
            onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
          />
        </div>

        <div class="field-row-stacked" style="margin-bottom: 12px;">
          <label for="message">{t.contact.message}</label>
          <textarea
            id="message"
            rows={4}
            value={message}
            onInput={(e) => setMessage((e.target as HTMLTextAreaElement).value)}
          />
        </div>

        {error && <p style="color: red;">{error}</p>}

        <button type="submit">{t.contact.send}</button>
      </form>
    </div>
  );
}
