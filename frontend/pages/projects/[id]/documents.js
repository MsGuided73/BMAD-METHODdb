import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import DocumentPreview from '../../../components/DocumentPreview';
import { useAuth } from '../../../contexts/AuthContext';
import { getApiUrl } from '../../../utils/api';
import {
  DocumentIcon,
  ChevronLeftIcon,
  DownloadIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon,
  FolderIcon
} from '../../../components/Icons';

export default function ProjectDocuments() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    
    if (id) {
      loadProjectAndDocuments();
    }
  }, [id, isAuthenticated, router]);

  const loadProjectAndDocuments = async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      
      // Load project details and documents in parallel
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentTypeColor = (type) => {
    const colors = {
      'Project Brief': 'bg-purple-100 text-purple-800',
      'Product Requirements Document': 'bg-blue-100 text-blue-800',
      'Architecture Document': 'bg-indigo-100 text-indigo-800',
      'Frontend Architecture Document': 'bg-pink-100 text-pink-800',
      'UI/UX Specification': 'bg-green-100 text-green-800',
      'Style Guide': 'bg-yellow-100 text-yellow-800',
      'Screen Inventory': 'bg-orange-100 text-orange-800',
      'Component Specifications': 'bg-red-100 text-red-800',
      'User Story': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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
            <p className="mt-4 text-gray-600">Loading project documents...</p>
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
                    Project Documents
                  </h1>
                  <p className="mt-2 text-gray-600">
                    {project?.projectName || 'Loading...'} • {documents.length} document{documents.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              {project && (
                <div className="flex items-center space-x-3">
                  <Link href={`/wizard/${project.id}`}>
                    <button className="btn btn-outline">
                      Continue Project
                    </button>
                  </Link>
                  <Link href={`/projects/${project.id}/analytics`}>
                    <button className="btn btn-primary">
                      View Analytics
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Documents List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FolderIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Documents
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {documents.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <DocumentIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No documents found</p>
                      <p className="text-sm mt-1">Documents will appear here as you progress through the BMAD workflow.</p>
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedDocument?.id === doc.id ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                        }`}
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {doc.documentType}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {doc.phase} Phase
                            </p>
                            <div className="flex items-center mt-2 text-xs text-gray-400">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {formatDate(doc.createdAt)}
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDocumentTypeColor(doc.documentType)}`}>
                            {doc.documentType.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Document Preview */}
            <div className="lg:col-span-2">
              {selectedDocument ? (
                <DocumentPreview
                  title={selectedDocument.documentType}
                  content={selectedDocument.content}
                  filename={`${selectedDocument.documentType.toLowerCase().replace(/\s+/g, '-')}.md`}
                  projectName={project?.projectName}
                  documentType={selectedDocument.documentType}
                  metadata={{
                    phase: selectedDocument.phase,
                    createdAt: selectedDocument.createdAt,
                    wordCount: selectedDocument.wordCount,
                    characterCount: selectedDocument.characterCount
                  }}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <EyeIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Document
                  </h3>
                  <p className="text-gray-500">
                    Choose a document from the list to preview its content.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
