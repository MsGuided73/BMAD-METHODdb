'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load agents data
    // This would be migrated from the original pages/agents.js
    setLoading(false);
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">BMAD Agents</h1>
            <p className="text-lg text-gray-600 mb-8">
              Explore the specialized AI agents that power the BMAD Method
            </p>
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            ) : (
              <div className="text-gray-600">
                Agent content will be migrated from pages/agents.js
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}


