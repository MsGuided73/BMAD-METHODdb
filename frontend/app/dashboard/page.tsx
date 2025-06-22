'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import axios from 'axios';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { GradientButton } from '../../components/ui/gradient-button';
import ProjectCard from '../../components/dashboard/ProjectCard';
import ProjectFilters from '../../components/dashboard/ProjectFilters';
import ProjectStats from '../../components/dashboard/ProjectStats';
import CreateProjectModal from '../../components/dashboard/CreateProjectModal';
import { PlusIcon, MagnifyingGlassIcon } from '../../components/Icons';
import { getApiUrl } from '../../utils/api';

// Note: This would be generated metadata in a real App Router setup
// export const metadata: Metadata = {
//   title: 'Project Hub',
//   description: 'Manage your BMAD Method projects and track your progress',
// };

interface Project {
  id: string;
  projectName: string;
  description: string;
  currentPhase: string;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isPublic: boolean;
  phases: Record<string, any>;
  generatedFiles: string[];
  source?: string; // Optional source property (local, airtable, etc.)
}

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  archived: number;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats>({ total: 0, active: 0, completed: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    phase: 'all',
    source: 'all'
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    loadProjects();
  }, [isAuthenticated, router]);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, filters]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = getApiUrl();
      const response = await axios.get(`${apiUrl}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const { projects: projectsData, stats: statsData } = response.data;

      setProjects(projectsData || []);
      setStats(statsData || { total: 0, active: 0, completed: 0, archived: 0 });
    } catch (error: any) {
      console.error('Failed to load projects:', error);
      setError(error.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    // Phase filter
    if (filters.phase !== 'all') {
      filtered = filtered.filter(project => project.currentPhase === filters.phase);
    }

    // Source filter (if needed)
    if (filters.source !== 'all') {
      filtered = filtered.filter(project => project.source === filters.source);
    }

    setFilteredProjects(filtered);
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      const apiUrl = getApiUrl();
      const response = await axios.post(`${apiUrl}/api/projects`, projectData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const newProject = response.data.project;

      setProjects(prev => [newProject, ...prev]);
      setShowCreateModal(false);

      // Navigate to the new project's wizard
      router.push(`/wizard/${newProject.id}`);
    } catch (error: any) {
      console.error('Failed to create project:', error);
      setError(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const apiUrl = getApiUrl();
      await axios.delete(`${apiUrl}/api/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      setError(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleDuplicateProject = async (project: Project) => {
    try {
      const apiUrl = getApiUrl();
      const duplicateData = {
        ...project,
        projectName: `${project.projectName} (Copy)`,
        id: undefined, // Remove ID so backend generates new one
        createdAt: undefined,
        updatedAt: undefined
      };

      const response = await axios.post(`${apiUrl}/api/projects`, duplicateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const newProject = response.data.project;

      setProjects(prev => [newProject, ...prev]);
    } catch (error: any) {
      console.error('Failed to duplicate project:', error);
      setError(error.response?.data?.message || 'Failed to duplicate project');
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Project Hub
                </h1>
                <p className="mt-2 text-gray-600">
                  Welcome back, {user?.firstName || user?.email}! Manage your BMAD Method projects and track your progress.
                </p>
              </div>
              <GradientButton
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-6 py-3"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Project
              </GradientButton>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <ProjectStats stats={stats} />

          {/* Filters and Search */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>
              <ProjectFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Projects Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Loading projects...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {projects.length === 0 
                    ? 'Create your first BMAD Method project to get started with AI-driven development planning.'
                    : 'Try adjusting your search terms or filters to find what you\'re looking for.'
                  }
                </p>
                {projects.length === 0 && (
                  <GradientButton
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Your First Project
                  </GradientButton>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDeleteProject}
                  onDuplicate={handleDuplicateProject}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProject}
        />
      </div>
    </Layout>
  );
}
