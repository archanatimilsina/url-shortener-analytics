import { useState } from 'react';
import styled from 'styled-components';
import CountdownTimer from './CountdownTimer';
import useApi from '../hooks/api';

const BACKEND_ORIGIN = import.meta.env.VITE_API_BASE;

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function URLShortenerForm({ onNewUrl }) {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState(null);
  const [retryAfter, setRetryAfter] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const { post, loading, error } = useApi();

  const fullShortUrl = shortUrl ? `${BACKEND_ORIGIN}/${shortUrl}` : null;

  async function handleSubmit(e) {
    e.preventDefault();

    const trimmed = url.trim();
    if (!isValidUrl(trimmed)) {
      setValidationError('Enter a valid url, starting with http:// or https://');
      return;
    }
    setValidationError(null);

    const { success, status, data } = await post('/api/shorten/', { url: trimmed });
    if (status === 429) {
      setRetryAfter(data.retry_after_seconds);
    } else if (success) {
      setShortUrl(data.alias);
      setUrl('');
      setCopied(false);
      setCopyError(null);
      onNewUrl();
    }
  }

  async function handleCopy() {
    if (!fullShortUrl) return;
    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopied(true);
      setCopyError(null);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError('Copy failed — select and copy the link manually.');
      setTimeout(() => setCopyError(null), 3000);
    }
  }

  function handleFollow() {
    if (!fullShortUrl) return;
    window.open(fullShortUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <Form onSubmit={handleSubmit}>
      <InputRow>
        <Input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (validationError) setValidationError(null);
          }}
          placeholder="Paste a long URL"
        />
        <Button type="submit" disabled={loading || retryAfter > 0}>
          {loading ? 'Shortening...' : 'Shorten'}
        </Button>
      </InputRow>

      {validationError && <Toast>{validationError}</Toast>}

      {retryAfter > 0 && (
        <CountdownTimer seconds={retryAfter} onComplete={() => setRetryAfter(null)} />
      )}

      {fullShortUrl && (
        <ShortUrlBox>
          <ShortUrlText>{fullShortUrl}</ShortUrlText>
          <IconGroup>
            <IconButton type="button" onClick={handleFollow} aria-label="Open short url">
              <FollowIcon />
              <Tooltip>Follow url</Tooltip>
            </IconButton>
            <IconButton type="button" onClick={handleCopy} aria-label="Copy short url">
              {copied ? <CheckIcon /> : <CopyIcon />}
              <Tooltip>{copied ? 'Copied' : 'Copy'}</Tooltip>
            </IconButton>
          </IconGroup>
        </ShortUrlBox>
      )}

      {copyError && <Toast>{copyError}</Toast>}
      {error && <ErrorText>{error}</ErrorText>}
    </Form>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function FollowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const InputRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.6rem 0.8rem;
  border: 1.5px solid rgb(210, 205, 190);
  border-radius: 4px;
  background: rgb(250, 249, 245);
  font-size: 0.95rem;
  color: rgb(58, 54, 46);

  &::placeholder {
    color: rgb(160, 155, 140);
  }

  &:focus {
    outline: none;
    border-color: rgb(122, 117, 103);
  }
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  border: 1.5px solid rgb(58, 54, 46);
  border-radius: 4px;
  background: rgb(58, 54, 46);
  color: rgb(246, 245, 240);
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    background: rgb(200, 195, 180);
    border-color: rgb(200, 195, 180);
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: rgb(80, 76, 65);
    border-color: rgb(80, 76, 65);
  }
`;

const Toast = styled.p`
  margin: 0;
  padding: 0.5rem 0.75rem;
  background: rgb(250, 240, 235);
  border: 1.5px solid rgb(220, 180, 165);
  border-radius: 4px;
  color: rgb(178, 74, 58);
  font-size: 0.85rem;
`;

const ShortUrlBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: rgb(250, 249, 245);
  border: 1.5px dashed rgb(200, 195, 180);
  border-radius: 4px;
  padding: 0.5rem 0.5rem 0.5rem 0.75rem;
`;

const ShortUrlText = styled.span`
  font-family: 'SF Mono', ui-monospace, monospace;
  font-size: 0.85rem;
  color: rgb(90, 86, 74);
  word-break: break-all;
`;

const IconGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
`;

const IconButton = styled.button`
  position: relative;
  border: none;
  background: transparent;
  padding: 4px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: rgb(122, 117, 103);

  &:hover {
    color: rgb(58, 54, 46);
  }

  &:hover > span {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Tooltip = styled.span`
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%) translateY(2px);
  background: rgb(58, 54, 46);
  color: rgb(246, 245, 240);
  font-size: 0.7rem;
  font-weight: 500;
  padding: 3px 7px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s ease, transform 0.12s ease;
`;

const ErrorText = styled.p`
  color: rgb(178, 74, 58);
  font-size: 0.9rem;
`;

export default URLShortenerForm;