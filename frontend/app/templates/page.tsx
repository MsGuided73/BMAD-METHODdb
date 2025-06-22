'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set page title for SEO
    document.title = 'BMAD Templates - BMAD Method Planning';

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional templates for every phase of the BMAD Method');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Professional templates for every phase of the BMAD Method';
      document.head.appendChild(meta);
    }

    // Load templates data
    // This would be migrated from the original pages/templates.js
    setLoading(false);
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">BMAD Templates</h1>
            <p className="text-lg text-gray-600 mb-8">
              Professional templates for every phase of the BMAD Method
            </p>
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            ) : (
              <div className="text-gray-600">
                Template content will be migrated from pages/templates.js
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}


