import '../styles/globals.css';
import { useState, useEffect } from 'react';
import Head from 'next/head';

// Context for managing global state
import { SessionProvider } from '../contexts/SessionContext';
import { AuthProvider } from '../contexts/AuthContext';

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>BMAD Method Planning App</title>
        <meta name="description" content="AI-driven development planning using the BMAD Method" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AuthProvider>
        <SessionProvider>
          <Component {...pageProps} />
        </SessionProvider>
      </AuthProvider>
    </>
  );
}

export default MyApp;
