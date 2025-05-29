import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useSession } from '../contexts/SessionContext';
import Layout from '../components/Layout';

// Using inline SVG icons for compatibility
const PlayIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DocumentTextIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CogIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function Home() {
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const { api } = useSession();
  const router = useRouter();

  const handleStartPlanning = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setLoading(true);
    try {
      const session = await api.createSession(projectName.trim());
      router.push(`/wizard/${session.id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Guided Planning',
      description: 'Step-by-step wizard walks you through the complete BMAD Method planning process'
    },
    {
      icon: CogIcon,
      title: 'AI-Ready Output',
      description: 'Generate comprehensive documentation and agent prompts ready for LLM coding tools'
    },
    {
      icon: CheckCircleIcon,
      title: 'Quality Assurance',
      description: 'Built-in checklists ensure your planning meets professional standards'
    }
  ];

  const phases = [
    { name: 'Analyst', description: 'Project brief and research', color: 'bg-blue-500' },
    { name: 'Product Manager', description: 'Requirements and PRD', color: 'bg-green-500' },
    { name: 'Architect', description: 'System architecture', color: 'bg-purple-500' },
    { name: 'Design Architect', description: 'UI/UX and frontend', color: 'bg-pink-500' },
    { name: 'Product Owner', description: 'Validation and stories', color: 'bg-yellow-500' },
    { name: 'Scrum Master', description: 'Story refinement', color: 'bg-indigo-500' }
  ];

  return (
    <>
      <Head>
        <title>BMAD Method Planning App - AI-Driven Development Planning</title>
        <meta name="description" content="Transform your project ideas into comprehensive development plans using the BMAD Method. Generate AI-ready documentation and agent prompts." />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  <span className="text-gradient">BMAD Method</span>
                  <br />
                  Planning Application
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Transform your project ideas into comprehensive development plans using AI-driven methodology.
                  Generate ready-to-use documentation and agent prompts for LLM coding tools.
                </p>

                {/* Start Planning Form */}
                <div className="max-w-md mx-auto mb-12">
                  <form onSubmit={handleStartPlanning} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Enter your project name..."
                        className="form-input text-center text-lg py-3"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !projectName.trim()}
                      className="btn btn-primary btn-lg w-full shadow-glow"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Creating Session...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <PlayIcon className="h-5 w-5 mr-2" />
                          Start Planning
                        </div>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Use the BMAD Method?
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Elevate your "vibe coding" to professional project planning with structured AI-driven methodology
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="card text-center hover:shadow-lg transition-shadow">
                    <feature.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Process Overview */}
          <div className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  The BMAD Planning Process
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Six specialized agent phases guide you from idea to implementation-ready documentation
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {phases.map((phase, index) => (
                  <div key={index} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className={`w-8 h-8 rounded-full ${phase.color} text-white flex items-center justify-center text-sm font-bold mr-3`}>
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-semibold">{phase.name}</h3>
                    </div>
                    <p className="text-gray-600">{phase.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-16 bg-primary-600">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Development Process?
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Join the AI-driven development revolution with the BMAD Method
              </p>
              <button
                onClick={() => document.querySelector('input').focus()}
                className="btn bg-white text-primary-600 hover:bg-gray-50 btn-lg shadow-lg"
              >
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
