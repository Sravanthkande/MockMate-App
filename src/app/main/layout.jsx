import React from 'react';

// NOTE: In a real Next.js app, this would include global CSS imports 
// and components like ClerkProvider for authentication.

const RootLayout = ({ children }) => {
  return (
    // The html and body tags are standard for the root layout
    <html lang="en">
      <head>
        <title>Mock Mate AI - Interview Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        {/* Tailwind config goes here in a real single-file app, but is mocked/assumed */}
        <style>{`
          .font-sans { font-family: Inter, sans-serif; }
          .bg-primary-500 { background-color: #3b82f6; } /* blue-500 */
          .bg-primary-600 { background-color: #2563eb; } /* blue-600 */
          .text-primary-600 { color: #2563eb; } /* blue-600 */
        `}</style>
      </head>
      <body className="bg-gray-100 antialiased">
        {/* Auth Provider would wrap this in a real project (e.g., <ClerkProvider>) */}
        {children} 
      </body>
    </html>
  );
};

export default RootLayout;
