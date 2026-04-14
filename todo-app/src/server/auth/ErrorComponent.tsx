import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

interface OAuthErrorInfo {
  error: string;
  statusCode: number;
}

function ErrorPage({ error, statusCode }: OAuthErrorInfo) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Authentication Error</title>
        <style>{`
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f9fafb;
            color: #111827;
          }
          .container {
            text-align: center;
            max-width: 400px;
            padding: 2rem;
          }
          .status-code {
            font-size: 3rem;
            font-weight: 700;
            color: #ef4444;
            margin-bottom: 0.5rem;
          }
          .error-message {
            font-size: 1.125rem;
            color: #6b7280;
            margin-bottom: 1.5rem;
          }
          a {
            display: inline-block;
            padding: 0.5rem 1.5rem;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 0.375rem;
            font-weight: 500;
          }
          a:hover {
            background-color: #2563eb;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="status-code">{statusCode}</div>
          <div className="error-message">{error}</div>
          <a href="/login">Back to Sign In</a>
        </div>
      </body>
    </html>
  );
}

export function ErrorComponent(props: OAuthErrorInfo): string {
  return `<!DOCTYPE html>${renderToStaticMarkup(<ErrorPage {...props} />)}`;
}
