import React from 'react';

const URL_REGEX = /((?:https?:\/\/|www\.)[^\s<]+)/gi;

// Turns "check https://ayinz.com now" into text with a clickable <a> for the URL,
// trimming trailing punctuation that's part of the sentence, not the link.
export function linkify(text: string, linkClassName = 'underline underline-offset-2 decoration-1 hover:opacity-80 transition-opacity break-all'): React.ReactNode[] {
  if (!text) return [text];

  // With one capturing group, String.split interleaves matches at odd indices.
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) => {
    const isUrl = i % 2 === 1;
    if (!isUrl) return part;

    let url = part;
    let trailing = '';
    const trailingMatch = url.match(/[.,!?;:)\]]+$/);
    if (trailingMatch) {
      trailing = trailingMatch[0];
      url = url.slice(0, -trailing.length);
    }

    const href = url.startsWith('www.') ? `https://${url}` : url;

    return (
      <React.Fragment key={i}>
        <a href={href} target="_blank" rel="noopener noreferrer" className={linkClassName} onClick={e => e.stopPropagation()}>
          {url}
        </a>
        {trailing}
      </React.Fragment>
    );
  });
}
