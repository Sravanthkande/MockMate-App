import './globals.css';

export const metadata = {
  title: 'MockMate AI - Interview Practice Platform',
  description: 'AI-powered mock interview platform to help you prepare for job interviews',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}

