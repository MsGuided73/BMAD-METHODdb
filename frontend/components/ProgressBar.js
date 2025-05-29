import { CheckIcon } from './Icons';

const phases = [
  { id: 'analyst', name: 'Analyst', description: 'Project Brief' },
  { id: 'pm', name: 'Product Manager', description: 'Requirements & PRD' },
  { id: 'architect', name: 'Architect', description: 'System Architecture' },
  { id: 'designArchitect', name: 'Design Architect', description: 'UI/UX & Frontend' },
  { id: 'po', name: 'Product Owner', description: 'Validation & Stories' },
  { id: 'sm', name: 'Scrum Master', description: 'Story Refinement' }
];

export default function ProgressBar({ session }) {
  const currentPhaseIndex = phases.findIndex(phase => phase.id === session.currentPhase);
  const completedPhases = Object.keys(session.phases).filter(phase => session.phases[phase].completed);
  const progressPercentage = (completedPhases.length / phases.length) * 100;

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="progress-bar mb-6">
        <div 
          className="progress-fill"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Phase Steps */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {phases.map((phase, index) => {
          const isCompleted = session.phases[phase.id]?.completed;
          const isCurrent = phase.id === session.currentPhase;
          const isAccessible = index <= currentPhaseIndex || isCompleted;

          return (
            <div
              key={phase.id}
              className={`relative flex flex-col items-center text-center p-3 rounded-lg transition-all ${
                isCompleted
                  ? 'bg-green-50 border-2 border-green-200'
                  : isCurrent
                  ? 'bg-primary-50 border-2 border-primary-200'
                  : isAccessible
                  ? 'bg-gray-50 border-2 border-gray-200'
                  : 'bg-gray-50 border-2 border-gray-100 opacity-50'
              }`}
            >
              {/* Phase Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-primary-500 text-white'
                    : isAccessible
                    ? 'bg-gray-300 text-gray-600'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>

              {/* Phase Info */}
              <div>
                <h3 className={`text-sm font-medium mb-1 ${
                  isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {phase.name}
                </h3>
                <p className={`text-xs ${
                  isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {phase.description}
                </p>
              </div>

              {/* Current Phase Indicator */}
              {isCurrent && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{completedPhases.length}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-primary-600">
            {currentPhaseIndex >= 0 ? currentPhaseIndex + 1 : phases.length}
          </div>
          <div className="text-sm text-gray-600">Current Phase</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-600">{phases.length}</div>
          <div className="text-sm text-gray-600">Total Phases</div>
        </div>
      </div>
    </div>
  );
}
