import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useSession } from '../../contexts/SessionContext';
import Layout from '../../components/Layout';
import PhaseWizard from '../../components/PhaseWizard';
import ProgressBar from '../../components/ProgressBar';

export default function WizardPage() {
  const router = useRouter();
  const { sessionId } = router.query;
  const { session, loading, api } = useSession();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (sessionId && !session) {
      loadSession();
    } else if (session) {
      setInitializing(false);
    }
  }, [sessionId, session]);

  const loadSession = async () => {
    try {
      await api.loadSession(sessionId);
    } catch (error) {
      console.error('Failed to load session:', error);
      router.push('/');
    } finally {
      setInitializing(false);
    }
  };

  if (initializing || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your planning session...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Session Not Found</h1>
            <p className="text-gray-600 mb-6">The planning session you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/')}
              className="btn btn-primary"
            >
              Start New Session
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{session.projectName} - BMAD Planning</title>
        <meta name="description" content={`Planning session for ${session.projectName} using the BMAD Method`} />
      </Head>
      
      <Layout>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <h1 className="text-2xl font-bold text-gray-900">{session.projectName}</h1>
                  <p className="text-gray-600">BMAD Method Planning Session</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">Session ID: {session.id.slice(0, 8)}</span>
                  <button
                    onClick={() => router.push('/')}
                    className="btn btn-outline btn-sm"
                  >
                    Exit Session
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6">
                <ProgressBar session={session} />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PhaseWizard session={session} />
          </div>
        </div>
      </Layout>
    </>
  );
}
