import { useState } from 'react';
import Link from 'next/link';
import {
  PlayIcon,
  EyeIcon,
  DocumentIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  DocumentDuplicateIcon,
  EllipsisVerticalIcon,
  ArchiveBoxIcon
} from '../Icons';
import { getApiUrl } from '../../utils/api';

const phaseNames = {
  analyst: 'Business Analyst',
  pm: 'Project Manager',
  architect: 'Solution Architect',
  designArchitect: 'Design Architect',
  po: 'Product Owner',
  sm: 'Scrum Master'
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  paused: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-gray-100 text-gray-800'
};

const phaseColors = {
  analyst: 'bg-purple-100 text-purple-800',
  pm: 'bg-blue-100 text-blue-800',
  architect: 'bg-indigo-100 text-indigo-800',
  designArchitect: 'bg-pink-100 text-pink-800',
  po: 'bg-green-100 text-green-800',
  sm: 'bg-orange-100 text-orange-800'
};

export default function ProjectCard({ project, onDelete, onDuplicate }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleDelete = () => {
    onDelete(project.id);
    setShowDeleteConfirm(false);
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(project);
    }
    setShowActionsMenu(false);
  };

  const handleExportProject = async () => {
    try {
      setIsExporting(true);
      setShowActionsMenu(false);

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/projects/${project.id}/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('bmad_token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.projectName.toLowerCase().replace(/\s+/g, '-')}-export.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        console.error('Export failed');
        alert('Failed to export project');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export project');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {project.projectName}
            </h3>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {project.description || 'No description provided'}
            </p>
          </div>
          
          {/* Source Badge */}
          <div className="ml-4 flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              project.source === 'local' 
                ? 'bg-gray-100 text-gray-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {project.source === 'local' ? 'Local' : 'Cloud'}
            </span>
          </div>
        </div>

        {/* Status and Phase */}
        <div className="mt-4 flex items-center space-x-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColors[project.status] || statusColors.active
          }`}>
            {project.status || 'active'}
          </span>
          
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            phaseColors[project.currentPhase] || phaseColors.analyst
          }`}>
            {phaseNames[project.currentPhase] || project.currentPhase}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">{project.progress || 0}%</span>
          </div>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress || 0)}`}
              style={{ width: `${project.progress || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="mt-4 flex items-center">
            <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{project.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            Created {formatDate(project.createdAt)}
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            Updated {formatDate(project.updatedAt)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Continue/View Button */}
            <Link href={`/wizard/${project.id}`}>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                <PlayIcon className="h-3 w-3 mr-1" />
                {project.status === 'completed' ? 'View' : 'Continue'}
              </button>
            </Link>

            {/* Documents Button */}
            <Link href={`/projects/${project.id}/documents`}>
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                <DocumentIcon className="h-3 w-3 mr-1" />
                Docs
              </button>
            </Link>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            {showDeleteConfirm ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 hover:text-red-900"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  className="inline-flex items-center p-1.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded transition-colors"
                  title="More actions"
                >
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </button>

                {/* Actions Dropdown */}
                {showActionsMenu && (
                  <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={handleExportProject}
                      disabled={isExporting}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                      {isExporting ? 'Exporting...' : 'Export Project'}
                    </button>

                    {onDuplicate && (
                      <button
                        onClick={handleDuplicate}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                        Duplicate Project
                      </button>
                    )}

                    <Link href={`/projects/${project.id}/analytics`}>
                      <button
                        onClick={() => setShowActionsMenu(false)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <ChartBarIcon className="h-4 w-4 mr-2" />
                        View Analytics
                      </button>
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setShowActionsMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete Project
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Generated Files Count */}
        {project.generatedFiles && project.generatedFiles.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center text-xs text-gray-500">
              <DocumentIcon className="h-4 w-4 mr-1" />
              {project.generatedFiles.length} generated document{project.generatedFiles.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
