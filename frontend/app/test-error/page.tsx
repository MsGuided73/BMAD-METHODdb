'use client';

import { useState } from 'react';
import Layout from '../../components/Layout';

// Component that can throw an error for testing
function ErrorTrigger({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('Test error for Error Boundary testing');
  }
  return <div>No error - Error Boundary is working correctly!</div>;
}

export default function TestErrorPage() {
  const [triggerError, setTriggerError] = useState(false);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Error Boundary Test Page
            </h1>
            <p className="text-gray-600 mb-6">
              This page is for testing the Error Boundary functionality. Click the button below to trigger an error and see how the Error Boundary handles it.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => setTriggerError(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Trigger Error (Test Error Boundary)
              </button>
              
              <button
                onClick={() => setTriggerError(false)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ml-4"
              >
                Reset (No Error)
              </button>
            </div>

            <div className="mt-6 p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Test Result:</h3>
              <ErrorTrigger shouldError={triggerError} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
