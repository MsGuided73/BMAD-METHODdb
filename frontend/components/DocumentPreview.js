import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { getApiUrl } from '../utils/api';
import { EyeIcon, DocumentIcon } from './Icons';

export default function DocumentPreview({ title, content, filename, projectName, documentType, metadata }) {
  const [viewMode, setViewMode] = useState('preview'); // preview, raw
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  const downloadFile = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    try {
      setIsExportingPDF(true);

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/pdf-export/document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          title: title || filename?.replace('.md', ''),
          projectName: projectName || 'Project',
          documentType: documentType || 'Document',
          metadata: metadata || {}
        })
      });

      if (response.ok) {
        // Get the PDF blob
        const blob = await response.blob();

        // Extract filename from response headers or generate one
        const contentDisposition = response.headers.get('Content-Disposition');
        let pdfFilename = 'document.pdf';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            pdfFilename = filenameMatch[1];
          }
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = pdfFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        console.error('PDF export failed:', errorData.error);
        alert('Failed to export PDF: ' + errorData.error);
      }
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF: ' + error.message);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DocumentIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex bg-white border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 text-sm font-medium rounded-l-md transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <EyeIcon className="h-4 w-4 inline mr-1" />
                Preview
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-3 py-1 text-sm font-medium rounded-r-md transition-colors ${
                  viewMode === 'raw'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Raw
              </button>
            </div>

            {/* Actions */}
            <button
              onClick={copyToClipboard}
              className="btn btn-outline btn-sm"
            >
              Copy
            </button>
            <button
              onClick={downloadFile}
              className="btn btn-outline btn-sm"
            >
              Download MD
            </button>
            <button
              onClick={exportToPDF}
              disabled={isExportingPDF}
              className="btn btn-primary btn-sm"
            >
              {isExportingPDF ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {viewMode === 'preview' ? (
          <div className="p-6 prose prose-sm max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <div className="p-4">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded border">
              {content}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            {content.split('\n').length} lines • {content.length} characters
          </div>
          <div>
            {filename && `Filename: ${filename}`}
          </div>
        </div>
      </div>
    </div>
  );
}
