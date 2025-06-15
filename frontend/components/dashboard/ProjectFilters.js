import { ChevronDownIcon } from '../Icons';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' }
];

const phaseOptions = [
  { value: 'all', label: 'All Phases' },
  { value: 'analyst', label: 'Business Analyst' },
  { value: 'pm', label: 'Project Manager' },
  { value: 'architect', label: 'Solution Architect' },
  { value: 'design-architect', label: 'Design Architect' },
  { value: 'po', label: 'Product Owner' },
  { value: 'sm', label: 'Scrum Master' }
];

const sourceOptions = [
  { value: 'all', label: 'All Sources' },
  { value: 'local', label: 'Local' },
  { value: 'airtable', label: 'Cloud' }
];

export default function ProjectFilters({ filters, onFiltersChange }) {
  const handleFilterChange = (filterType, value) => {
    onFiltersChange({
      ...filters,
      [filterType]: value
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Status Filter */}
      <div className="relative">
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Phase Filter */}
      <div className="relative">
        <select
          value={filters.phase}
          onChange={(e) => handleFilterChange('phase', e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        >
          {phaseOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Source Filter */}
      <div className="relative">
        <select
          value={filters.source}
          onChange={(e) => handleFilterChange('source', e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        >
          {sourceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Clear Filters */}
      {(filters.status !== 'all' || filters.phase !== 'all' || filters.source !== 'all') && (
        <button
          onClick={() => onFiltersChange({ status: 'all', phase: 'all', source: 'all' })}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
