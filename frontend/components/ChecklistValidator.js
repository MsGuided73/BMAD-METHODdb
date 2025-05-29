import { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { ClipboardListIcon, CheckIcon, ExclamationIcon } from './Icons';

export default function ChecklistValidator({ checklistName, title, description, onComplete }) {
  const { checklists } = useSession();
  const [checklist, setChecklist] = useState(null);
  const [responses, setResponses] = useState({});
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChecklist();
  }, [checklistName]);

  const loadChecklist = async () => {
    try {
      const checklistData = await checklists.get(checklistName);
      setChecklist(checklistData);
    } catch (error) {
      console.error('Failed to load checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (itemId, checked) => {
    const newResponses = { ...responses, [itemId]: checked };
    setResponses(newResponses);
    
    // Auto-validate when responses change
    validateChecklist(newResponses);
  };

  const validateChecklist = async (currentResponses = responses) => {
    try {
      const result = await checklists.validate(checklistName, currentResponses);
      setValidation(result);
    } catch (error) {
      console.error('Failed to validate checklist:', error);
    }
  };

  const handleComplete = () => {
    if (validation && onComplete) {
      onComplete(validation);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Loading checklist...</span>
        </div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <ExclamationIcon className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-700">Failed to load checklist</span>
        </div>
      </div>
    );
  }

  const allItems = [
    ...checklist.items,
    ...checklist.sections.flatMap(section => section.items)
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <ClipboardListIcon className="h-6 w-6 text-gray-400 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        
        {validation && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">
                {validation.completedItems} of {validation.totalItems} items
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  validation.completionPercentage === 100 
                    ? 'bg-green-500' 
                    : validation.completionPercentage >= 50 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}
                style={{ width: `${validation.completionPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Checklist Content */}
      <div className="p-6 max-h-96 overflow-y-auto">
        {checklist.description && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">{checklist.description}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Standalone Items */}
          {checklist.items.length > 0 && (
            <div className="space-y-3">
              {checklist.items.map((item) => (
                <div key={item.id} className="checklist-item">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={responses[item.id] || false}
                      onChange={(e) => handleResponseChange(item.id, e.target.checked)}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-sm text-gray-700 cursor-pointer">
                      {item.text}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sectioned Items */}
          {checklist.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-3">
              <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
                {section.title}
              </h4>
              {section.items.map((item) => (
                <div key={item.id} className="checklist-item ml-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={responses[item.id] || false}
                      onChange={(e) => handleResponseChange(item.id, e.target.checked)}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-sm text-gray-700 cursor-pointer">
                      {item.text}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {validation ? (
              <span className={`font-medium ${
                validation.isComplete 
                  ? 'text-green-600' 
                  : 'text-yellow-600'
              }`}>
                {validation.isComplete 
                  ? 'All requirements met!' 
                  : `${validation.completionPercentage}% complete`}
              </span>
            ) : (
              'Complete the checklist to validate'
            )}
          </div>
          
          <button
            onClick={handleComplete}
            disabled={!validation || !validation.isComplete}
            className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="h-4 w-4 mr-1" />
            {validation?.isComplete ? 'Validation Complete' : 'Complete Checklist'}
          </button>
        </div>
      </div>
    </div>
  );
}
