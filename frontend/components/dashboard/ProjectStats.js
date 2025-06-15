import { 
  FolderIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ChartBarIcon,
  DocumentIcon,
  CalendarIcon
} from '../Icons';

export default function ProjectStats({ stats = {} }) {
  const statItems = [
    {
      name: 'Total Projects',
      value: stats.totalProjects || 0,
      icon: FolderIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Active Projects',
      value: stats.activeProjects || 0,
      icon: ClockIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Completed Projects',
      value: stats.completedProjects || 0,
      icon: CheckCircleIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Documents Generated',
      value: stats.totalDocuments || 0,
      icon: DocumentIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      name: 'Average Progress',
      value: `${Math.round(stats.averageProgress || 0)}%`,
      icon: ChartBarIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      name: 'This Month',
      value: stats.projectsThisMonth || 0,
      icon: CalendarIcon,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statItems.map((item) => (
        <div key={item.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-lg ${item.bgColor}`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 truncate">
                {item.name}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {item.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
