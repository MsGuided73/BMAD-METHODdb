import { useAuth } from '../../contexts/AuthContext';
import { ClockIcon, ExclamationTriangleIcon } from '../Icons';

export default function TrialStatus() {
  const { user, subscription, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user || subscription.status !== 'trial') {
    return null;
  }

  const { daysLeftInTrial, isActive } = subscription;
  
  // Don't show if trial is not active
  if (!isActive) {
    return null;
  }

  // Determine urgency level
  const isUrgent = daysLeftInTrial <= 3;
  const isWarning = daysLeftInTrial <= 7;

  const getStatusColor = () => {
    if (isUrgent) return 'bg-red-50 border-red-200 text-red-800';
    if (isWarning) return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    return 'bg-blue-50 border-blue-200 text-blue-800';
  };

  const getIconColor = () => {
    if (isUrgent) return 'text-red-500';
    if (isWarning) return 'text-yellow-500';
    return 'text-blue-500';
  };

  const getMessage = () => {
    if (daysLeftInTrial === 0) {
      return 'Your trial expires today';
    }
    if (daysLeftInTrial === 1) {
      return '1 day left in your free trial';
    }
    return `${daysLeftInTrial} days left in your free trial`;
  };

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {isUrgent ? (
            <ExclamationTriangleIcon className={`h-5 w-5 ${getIconColor()}`} />
          ) : (
            <ClockIcon className={`h-5 w-5 ${getIconColor()}`} />
          )}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {getMessage()}
            </p>
            <button className="text-sm font-semibold underline hover:no-underline">
              Upgrade Now
            </button>
          </div>
          {isUrgent && (
            <p className="mt-1 text-xs">
              Upgrade now to continue using BMAD planning tools without interruption.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
