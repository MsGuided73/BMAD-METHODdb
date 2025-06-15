import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { useAuth } from '../../../contexts/AuthContext';
import { getApiUrl } from '../../../utils/api';
import { 
  ChevronLeftIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentIcon,
  CalendarIcon,
  CheckCircleIcon,
  PlayIcon,
  TagIcon
} from '../../../components/Icons';

export default function ProjectAnalytics() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    
    if (id) {
      loadProjectData();
    }
  }, [id, isAuthenticated, router]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      
      const [projectResponse, documentsResponse] = await Promise.all([
        fetch(`${apiUrl}/api/projects/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('bmad_token')}`
          }
        }),
        fetch(`${apiUrl}/api/projects/${id}/documents`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('bmad_token')}`
          }
        })
      ]);

      if (!projectResponse.ok) {
        throw new Error('Failed to load project');
      }

      const projectData = await projectResponse.json();
      const documentsData = await documentsResponse.json();
      
      if (projectData.success) {
        setProject(projectData.project);
      }
      
      if (documentsData.success) {
        setDocuments(documentsData.documents || []);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    if (!project) return {};

    const phases = ['analyst', 'pm', 'architect', 'design-architect', 'po', 'sm'];
    const phaseNames = {
      'analyst': 'Business Analyst',
      'pm': 'Project Manager', 
      'architect': 'Solution Architect',
      'design-architect': 'Design Architect',
      'po': 'Product Owner',
      'sm': 'Scrum Master'
    };

    const currentPhaseIndex = phases.indexOf(project.currentPhase);
    const completedPhases = currentPhaseIndex >= 0 ? currentPhaseIndex : 0;
    
    const totalWords = documents.reduce((sum, doc) => sum + (doc.wordCount || 0), 0);
    const totalCharacters = documents.reduce((sum, doc) => sum + (doc.characterCount || 0), 0);
    
    const projectAge = project.createdAt ? 
      Math.ceil((new Date() - new Date(project.createdAt)) / (1000 * 60 * 60 * 24)) : 0;
    
    const lastUpdate = project.updatedAt ? 
      Math.ceil((new Date() - new Date(project.updatedAt)) / (1000 * 60 * 60 * 24)) : 0;

    return {
      phases,
      phaseNames,
      currentPhaseIndex,
      completedPhases,
      totalWords,
      totalCharacters,
      projectAge,
      lastUpdate,
      documentsCount: documents.length,
      progress: project.progress || 0
    };
  };

  const analytics = calculateAnalytics();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading project analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link href="/dashboard">
                  <button className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-md">
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Project Analytics
                  </h1>
                  <p className="mt-2 text-gray-600">
                    {project?.projectName || 'Loading...'} • Detailed insights and progress
                  </p>
                </div>
              </div>
              
              {project && (
                <div className="flex items-center space-x-3">
                  <Link href={`/projects/${project.id}/documents`}>
                    <button className="btn btn-outline">
                      View Documents
                    </button>
                  </Link>
                  <Link href={`/wizard/${project.id}`}>
                    <button className="btn btn-primary">
                      Continue Project
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.progress}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-green-100">
                  <DocumentIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.documentsCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100">
                  <ClockIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Project Age</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.projectAge} days</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg bg-orange-100">
                  <CalendarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Last Update</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.lastUpdate} days ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* BMAD Phase Progress */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">BMAD Method Progress</h2>
              
              <div className="space-y-4">
                {analytics.phases?.map((phase, index) => {
                  const isCompleted = index < analytics.currentPhaseIndex;
                  const isCurrent = index === analytics.currentPhaseIndex;
                  const isPending = index > analytics.currentPhaseIndex;
                  
                  return (
                    <div key={phase} className="flex items-center">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-100 text-green-600' :
                        isCurrent ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircleIcon className="h-5 w-5" />
                        ) : isCurrent ? (
                          <PlayIcon className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      
                      <div className="ml-4 flex-1">
                        <p className={`text-sm font-medium ${
                          isCompleted ? 'text-green-900' :
                          isCurrent ? 'text-blue-900' :
                          'text-gray-500'
                        }`}>
                          {analytics.phaseNames?.[phase] || phase}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isCompleted ? 'Completed' :
                           isCurrent ? 'In Progress' :
                           'Pending'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Project Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Project Name</label>
                  <p className="text-sm text-gray-900">{project?.projectName}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-sm text-gray-900">{project?.description || 'No description provided'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project?.status === 'active' ? 'bg-green-100 text-green-800' :
                    project?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    project?.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project?.status || 'unknown'}
                  </span>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p className="text-sm text-gray-900">{formatDate(project?.createdAt)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="text-sm text-gray-900">{formatDate(project?.updatedAt)}</p>
                </div>
                
                {project?.tags && project.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tags</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Content Statistics</label>
                  <div className="mt-1 text-sm text-gray-900">
                    <p>{analytics.totalWords.toLocaleString()} words</p>
                    <p>{analytics.totalCharacters.toLocaleString()} characters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
