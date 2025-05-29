import { useState, useEffect } from 'react';
import { useSession } from '../../contexts/SessionContext';
import TemplateForm from '../TemplateForm';
import DocumentPreview from '../DocumentPreview';
import ChecklistValidator from '../ChecklistValidator';
import { PlusIcon, DocumentIcon, ClipboardListIcon, CheckIcon } from '../Icons';

export default function SMPhase({ session, phaseData, onComplete, onDataUpdate }) {
  const { templates } = useSession();
  const [step, setStep] = useState('stories'); // stories, validation, complete
  const [storySchema, setStorySchema] = useState(null);
  const [stories, setStories] = useState(phaseData.stories || []);
  const [currentStory, setCurrentStory] = useState({});
  const [checklistData, setChecklistData] = useState(phaseData.checklistData || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStoryTemplate();
  }, []);

  const loadStoryTemplate = async () => {
    try {
      const schema = await templates.getSchema('story-epicnum.storynum-short-title-copied-from-epic-file.md');
      setStorySchema(schema);
    } catch (error) {
      console.error('Failed to load story template schema:', error);
    }
  };

  const handleCurrentStoryChange = (data) => {
    setCurrentStory(data);
  };

  const handleGenerateStory = async () => {
    if (!storySchema || !currentStory.title) return;

    setLoading(true);
    try {
      // Get context from previous phases
      const prd = session.phases.pm?.outputs?.find(o => o.type === 'prd')?.content || '';
      const architecture = session.phases.architect?.outputs?.find(o => o.type === 'architecture')?.content || '';
      const uiuxSpec = session.phases.designArchitect?.outputs?.find(o => o.type === 'uiux-spec')?.content || '';
      
      const storyNumber = stories.length + 1;
      const result = await templates.fill('story-epicnum.storynum-short-title-copied-from-epic-file.md', {
        ...currentStory,
        'Project Name': session.projectName,
        'Story Number': storyNumber,
        'Epic Number': Math.ceil(storyNumber / 3), // Group stories into epics of 3
        'PRD Context': prd.slice(0, 1000),
        'Architecture Context': architecture.slice(0, 500),
        'UI/UX Context': uiuxSpec.slice(0, 500)
      });
      
      const newStory = {
        id: `story-${storyNumber}`,
        title: currentStory.title || `Story ${storyNumber}`,
        content: result.content,
        filename: `story-${storyNumber}-${currentStory.title?.toLowerCase().replace(/\s+/g, '-') || 'untitled'}.md`,
        createdAt: new Date().toISOString()
      };

      const updatedStories = [...stories, newStory];
      setStories(updatedStories);
      setCurrentStory({});
      
      onDataUpdate({ 
        ...phaseData, 
        stories: updatedStories,
        step 
      });
    } catch (error) {
      console.error('Failed to generate story:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStory = (storyId) => {
    const updatedStories = stories.filter(story => story.id !== storyId);
    setStories(updatedStories);
    onDataUpdate({ 
      ...phaseData, 
      stories: updatedStories,
      step 
    });
  };

  const handleProceedToValidation = () => {
    setStep('validation');
    onDataUpdate({ ...phaseData, stories, step: 'validation' });
  };

  const handleChecklistComplete = (checklistResults) => {
    setChecklistData(checklistResults);
    setStep('complete');
    onDataUpdate({ 
      ...phaseData, 
      stories,
      checklistData: checklistResults,
      step: 'complete' 
    });
  };

  const handleCompletePhase = () => {
    const outputs = stories.map(story => ({
      type: 'story',
      content: story.content,
      filename: story.filename,
      title: story.title
    }));

    onComplete({ 
      stories,
      checklistData,
      step: 'complete' 
    }, outputs);
  };

  const steps = [
    {
      id: 'stories',
      name: 'Story Creation',
      description: 'Create detailed user stories with acceptance criteria',
      icon: DocumentIcon,
      color: 'blue'
    },
    {
      id: 'validation',
      name: 'Story Validation',
      description: 'Validate stories meet definition of done criteria',
      icon: ClipboardListIcon,
      color: 'yellow'
    },
    {
      id: 'complete',
      name: 'Phase Complete',
      description: 'All stories created and ready for development',
      icon: CheckIcon,
      color: 'green'
    }
  ];

  return (
    <div className="p-6">
      {/* Step Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((stepOption, index) => (
            <div key={stepOption.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step === stepOption.id
                    ? `bg-${stepOption.color}-500 text-white`
                    : steps.findIndex(s => s.id === step) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <stepOption.icon className="h-5 w-5" />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  steps.findIndex(s => s.id === step) > index
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {steps.find(s => s.id === step)?.name}
          </h3>
          <p className="text-gray-600">
            {steps.find(s => s.id === step)?.description}
          </p>
        </div>
      </div>

      {/* Step Content */}
      {step === 'stories' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Scrum Master Story Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Create user stories following "As a... I want... So that..." format</li>
              <li>• Define clear acceptance criteria for each story</li>
              <li>• Ensure stories are testable and deliverable</li>
              <li>• Break down complex features into manageable stories</li>
            </ul>
          </div>

          {/* Story Creation Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Create New User Story</h4>
            
            {storySchema && (
              <TemplateForm
                schema={storySchema}
                data={currentStory}
                onChange={handleCurrentStoryChange}
                title="Story Details"
              />
            )}

            {Object.keys(currentStory).length > 0 && currentStory.title && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleGenerateStory}
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating Story...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Generate User Story
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Generated Stories */}
          {stories.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">
                  Generated Stories ({stories.length})
                </h4>
                {stories.length >= 3 && (
                  <button
                    onClick={handleProceedToValidation}
                    className="btn btn-primary"
                  >
                    Proceed to Validation
                  </button>
                )}
              </div>
              
              <div className="grid gap-4">
                {stories.map((story) => (
                  <div key={story.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{story.title}</h5>
                      <button
                        onClick={() => handleRemoveStory(story.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <DocumentPreview
                      title={story.title}
                      content={story.content}
                      filename={story.filename}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {stories.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600">No stories created yet. Use the form above to create your first user story.</p>
            </div>
          )}
        </div>
      )}

      {step === 'validation' && (
        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Stories Summary</h4>
            <p className="text-sm text-gray-600">
              {stories.length} user stories created and ready for validation
            </p>
          </div>
          
          <ChecklistValidator
            checklistName="story-definition-of-done-(dod)-checklist.md"
            title="Story Definition of Done Checklist"
            description="Validate all stories meet the definition of done criteria"
            onComplete={handleChecklistComplete}
          />
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <CheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Story Creation Complete
            </h3>
            <p className="text-green-700">
              All user stories have been created and validated. Ready for development!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Generated Stories</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {stories.length} user stories created</li>
                <li>• All stories validated</li>
                <li>• Ready for development sprint</li>
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
              <p className="text-sm text-gray-600">
                Download the complete project package with all documentation and agent prompts.
              </p>
            </div>
          </div>

          <button
            onClick={handleCompletePhase}
            className="btn btn-primary btn-lg"
          >
            Complete Scrum Master Phase
          </button>
        </div>
      )}
    </div>
  );
}
