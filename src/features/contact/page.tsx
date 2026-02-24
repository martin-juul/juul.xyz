import { useState, useCallback, useEffect } from 'preact/hooks';
import { useLanguage } from '../../context/language-context';
import { useStatus } from '../../context/status-context';

const iconStyle = {
  width: '16px',
  height: '16px',
  verticalAlign: 'middle',
  marginRight: '4px'
};

function SuccessMessage({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useLanguage();
  const { setStatusText } = useStatus();

  // Set status on mount
  useState(() => {
    setStatusText('Message sent!');
  });

  return (
    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <img src="/assets/icons/success.png" alt="Success" style={{ width: '32px', height: '32px' }} />
      </div>
      <h2 style={{ marginBottom: '8px' }}>Success!</h2>
      <p style={{ marginBottom: '24px' }}>
        <img src="/assets/icons/send.png" alt="" style={{ ...iconStyle, width: '20px', height: '20px' }} />
        {t.contact.success || 'Message sent successfully!'}
      </p>
      <button onClick={onDismiss}>OK</button>
    </div>
  );
}

export function Contact() {
  const { t } = useLanguage();
  const { setStatusText } = useStatus();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Update status bar based on form state
  const updateStatus = useCallback(() => {
    if (error) {
      setStatusText(error);
    } else if (!name && !email && !message) {
      setStatusText('Ready');
    } else {
      const filled = [name, email, message].filter(Boolean).length;
      setStatusText(`Fields: ${filled}/3`);
    }
  }, [error, name, email, message, setStatusText]);

  // Update status when form state changes
  useEffect(() => {
    updateStatus();
    return () => setStatusText('');
  }, [updateStatus]);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError(t.contact.error);
      return;
    }
    setError('');
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  if (submitted) {
    return <SuccessMessage onDismiss={() => setSubmitted(false)} />;
  }

  return (
    <div style={{ padding: '16px' }}>
      <p style={{ marginBottom: '16px' }}>{t.contact.getInTouch}</p>

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Contact Information</legend>

          <div class="field-row-stacked" style={{ marginBottom: '12px' }}>
            <label for="name">
              <img src="/assets/icons/user.png" alt="" style={iconStyle} />
              {t.contact.name}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onInput={(e) => setName((e.target as HTMLInputElement).value)}
              style={{ width: '100%' }}
            />
          </div>

          <div class="field-row-stacked" style={{ marginBottom: '12px' }}>
            <label for="email">
              <img src="/assets/icons/email.png" alt="" style={iconStyle} />
              {t.contact.email}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
              style={{ width: '100%' }}
            />
          </div>
        </fieldset>

        <fieldset style={{ marginTop: '16px' }}>
          <legend>Your Message</legend>

          <div class="field-row-stacked">
            <label for="message">
              <img src="/assets/icons/message.png" alt="" style={iconStyle} />
              {t.contact.message}
            </label>
            <textarea
              id="message"
              rows={5}
              value={message}
              onInput={(e) => setMessage((e.target as HTMLTextAreaElement).value)}
              style={{ width: '100%', resize: 'vertical' }}
            ></textarea>
          </div>
        </fieldset>

        {error && (
          <div
            class="field-border"
            style={{
              padding: '8px',
              marginTop: '16px',
              backgroundColor: '#fbf5f5'
            }}
          >
            <p style={{ color: '#800000', margin: 0, fontSize: '12px' }}>
              <img src="/assets/icons/warning.png" alt="" style={{ ...iconStyle, verticalAlign: 'text-bottom' }} />
              {error}
            </p>
          </div>
        )}

        <div class="field-row" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
          <button type="submit" class="default">
            <img src="/assets/icons/send.png" alt="" style={{ ...iconStyle, verticalAlign: 'text-bottom' }} />
            {t.contact.send}
          </button>
        </div>
      </form>
    </div>
  );
}
