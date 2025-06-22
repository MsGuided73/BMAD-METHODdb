'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../../components/Layout';

interface DocumentsPageProps {
  params: {
    id: string;
  };
}

export default function ProjectDocumentsPage({ params }: DocumentsPageProps) {
  const { id } = params;
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set page title for SEO
    document.title = `Project Documents - ${id} - BMAD Method Planning`;

    // Load project documents data
    // This would be migrated from the original pages/projects/[id]/documents.js
    setLoading(false);
  }, [id]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="btn btn-outline btn-sm mb-4"
            >
              ← Back to Project
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Project Documents</h1>
            <p className="text-gray-600">Project ID: {id}</p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Loading documents...</span>
            </div>
          ) : (
            <div className="text-gray-600">
              Documents content will be migrated from pages/projects/[id]/documents.js
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}


