import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { GradientButton } from '../components/ui/gradient-button';
import ProjectCard from '../components/dashboard/ProjectCard';
import ProjectFilters from '../components/dashboard/ProjectFilters';
import ProjectStats from '../components/dashboard/ProjectStats';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';
import { PlusIcon, MagnifyingGlassIcon } from '../components/Icons';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    phase: 'all',
    source: 'all'
  });
  const [stats, setStats] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, router]);

  // Load projects
  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  // Filter projects when search or filters change
  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, filters]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('bmad_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load projects');
      }

      const data = await response.json();
      
      if (data.success) {
        setProjects(data.projects);
        setStats(data.stats);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.projectName.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tags.some(tag => tag.toLowerCase().includes(query))
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

    // Source filter
    if (filters.source !== 'all') {
      filtered = filtered.filter(project => project.source === filters.source);
    }

    setFilteredProjects(filtered);
  };

  const handleCreateProject = async (projectData) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bmad_token')}`
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const data = await response.json();
      
      if (data.success) {
        setProjects([data.project, ...projects]);
        setShowCreateModal(false);
        
        // Navigate to the new project
        router.push(`/wizard/${data.project.id}`);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Create project error:', err);
      setError(err.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('bmad_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      const data = await response.json();
      
      if (data.success) {
        setProjects(projects.filter(p => p.id !== projectId));
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Delete project error:', err);
      setError(err.message);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your projects...</p>
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
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Project Dashboard
                </h1>
                <p className="mt-2 text-gray-600">
                  Welcome back, {user?.firstName || user?.email}! Manage your BMAD planning projects.
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

          {/* Search and Filters */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Filters */}
              <ProjectFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Projects Grid */}
          <div className="mt-8">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
                </h3>
                <p className="mt-2 text-gray-500">
                  {projects.length === 0 
                    ? 'Get started by creating your first BMAD planning project.'
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
                {projects.length === 0 && (
                  <div className="mt-6">
                    <GradientButton
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3"
                    >
                      Create Your First Project
                    </GradientButton>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
            )}
          </div>
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
