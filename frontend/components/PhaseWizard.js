import { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import AnalystPhase from './phases/AnalystPhase';
import PMPhase from './phases/PMPhase';
import ArchitectPhase from './phases/ArchitectPhase';
import DesignArchitectPhase from './phases/DesignArchitectPhase';
import POPhase from './phases/POPhase';
import SMPhase from './phases/SMPhase';
import CompletionPhase from './phases/CompletionPhase';
import { ChevronLeftIcon, ChevronRightIcon, UserIcon } from './Icons';

const phaseComponents = {
  analyst: AnalystPhase,
  pm: PMPhase,
  architect: ArchitectPhase,
  designArchitect: DesignArchitectPhase,
  po: POPhase,
  sm: SMPhase,
  completion: CompletionPhase
};

const phaseInfo = {
  analyst: {
    title: 'Analyst Phase',
    description: 'Create project brief and conduct initial research',
    agent: 'Business Analyst & Research Expert',
    icon: UserIcon,
    color: 'blue'
  },
  pm: {
    title: 'Product Manager Phase',
    description: 'Define requirements and create Product Requirements Document',
    agent: 'Product Manager',
    icon: UserIcon,
    color: 'green'
  },
  architect: {
    title: 'System Architect Phase',
    description: 'Design system architecture and technical specifications',
    agent: 'System Architect',
    icon: UserIcon,
    color: 'purple'
  },
  designArchitect: {
    title: 'Design Architect Phase',
    description: 'Create UI/UX specifications and frontend architecture',
    agent: 'Design Architect & Frontend Strategy Expert',
    icon: UserIcon,
    color: 'pink'
  },
  po: {
    title: 'Product Owner Phase',
    description: 'Validate requirements and prepare for story creation',
    agent: 'Technical Product Owner',
    icon: UserIcon,
    color: 'yellow'
  },
  sm: {
    title: 'Scrum Master Phase',
    description: 'Create and refine user stories for development',
    agent: 'Scrum Master',
    icon: UserIcon,
    color: 'indigo'
  },
  completion: {
    title: 'Planning Complete',
    description: 'Generate final documentation package',
    agent: 'Package Generator',
    icon: UserIcon,
    color: 'gray'
  }
};

export default function PhaseWizard({ session }) {
  const { api } = useSession();
  const [currentPhase, setCurrentPhase] = useState(session.currentPhase || 'analyst');
  const [phaseData, setPhaseData] = useState({});

  useEffect(() => {
    setCurrentPhase(session.currentPhase || 'analyst');
  }, [session.currentPhase]);

  const handlePhaseComplete = async (phase, data, outputs) => {
    try {
      await api.completePhase(session.id, phase, data, outputs);
      setPhaseData(prev => ({ ...prev, [phase]: data }));
    } catch (error) {
      console.error('Failed to complete phase:', error);
    }
  };

  const handlePhaseDataUpdate = (phase, data) => {
    setPhaseData(prev => ({ ...prev, [phase]: data }));
  };

  const getCurrentPhaseComponent = () => {
    const PhaseComponent = phaseComponents[currentPhase];
    if (!PhaseComponent) {
      return <div>Phase not found</div>;
    }

    return (
      <PhaseComponent
        session={session}
        phaseData={phaseData[currentPhase] || {}}
        onComplete={(data, outputs) => handlePhaseComplete(currentPhase, data, outputs)}
        onDataUpdate={(data) => handlePhaseDataUpdate(currentPhase, data)}
      />
    );
  };

  const info = phaseInfo[currentPhase] || phaseInfo.analyst;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Phase Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-lg bg-${info.color}-100 flex items-center justify-center mr-4`}>
              <info.icon className={`h-6 w-6 text-${info.color}-600`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{info.title}</h2>
              <p className="text-gray-600">{info.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Acting as</div>
            <div className="font-medium text-gray-900">{info.agent}</div>
          </div>
        </div>

        {/* Phase Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Phase {Object.keys(phaseInfo).indexOf(currentPhase) + 1} of {Object.keys(phaseInfo).length}
          </div>
          <div className="flex space-x-2">
            {/* Previous Phase Button */}
            <button
              onClick={() => {
                const phases = Object.keys(phaseInfo);
                const currentIndex = phases.indexOf(currentPhase);
                if (currentIndex > 0) {
                  setCurrentPhase(phases[currentIndex - 1]);
                }
              }}
              disabled={Object.keys(phaseInfo).indexOf(currentPhase) === 0}
              className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </button>

            {/* Next Phase Button */}
            <button
              onClick={() => {
                const phases = Object.keys(phaseInfo);
                const currentIndex = phases.indexOf(currentPhase);
                if (currentIndex < phases.length - 1) {
                  setCurrentPhase(phases[currentIndex + 1]);
                }
              }}
              disabled={Object.keys(phaseInfo).indexOf(currentPhase) === Object.keys(phaseInfo).length - 1}
              className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Phase Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {getCurrentPhaseComponent()}
      </div>
    </div>
  );
}
