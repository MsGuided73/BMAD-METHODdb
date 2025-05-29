import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { CogIcon, UserIcon, SparklesIcon } from '../components/Icons';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      setAgents(data.data || []);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAgent = async (agentName) => {
    try {
      const response = await fetch(`/api/agents/${encodeURIComponent(agentName)}`);
      const data = await response.json();
      setSelectedAgent(data);
    } catch (error) {
      console.error('Failed to load agent:', error);
    }
  };

  const agentCategories = {
    'backend': 'Backend Development',
    'frontend': 'Frontend Development',
    'database': 'Database & Data',
    'devops': 'DevOps & Infrastructure',
    'qa': 'Quality Assurance',
    'pm': 'Project Management'
  };

  const getAgentCategory = (agentName) => {
    const name = agentName.toLowerCase();
    if (name.includes('backend') || name.includes('api')) return 'backend';
    if (name.includes('frontend') || name.includes('ui') || name.includes('react')) return 'frontend';
    if (name.includes('database') || name.includes('db') || name.includes('sql')) return 'database';
    if (name.includes('devops') || name.includes('deploy') || name.includes('docker')) return 'devops';
    if (name.includes('qa') || name.includes('test') || name.includes('quality')) return 'qa';
    if (name.includes('pm') || name.includes('project') || name.includes('manager')) return 'pm';
    return 'other';
  };

  const groupedAgents = agents.reduce((acc, agent) => {
    const category = getAgentCategory(agent.name);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(agent);
    return acc;
  }, {});

  const getAgentIcon = (category) => {
    switch (category) {
      case 'backend':
      case 'frontend':
      case 'database':
        return CogIcon;
      case 'devops':
      case 'qa':
        return SparklesIcon;
      case 'pm':
        return UserIcon;
      default:
        return CogIcon;
    }
  };

  const getAgentColor = (category) => {
    const colors = {
      'backend': 'blue',
      'frontend': 'green',
      'database': 'purple',
      'devops': 'orange',
      'qa': 'red',
      'pm': 'indigo'
    };
    return colors[category] || 'gray';
  };

  return (
    <>
      <Head>
        <title>AI Development Agents - BMAD Planning</title>
        <meta name="description" content="Explore AI development agents for automated coding and project management" />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Development Agents</h1>
              <p className="text-lg text-gray-600">
                Specialized AI agents for automated development, each with unique expertise and capabilities
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Loading agents...</span>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Agent List */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Available Agents ({agents.length})
                      </h2>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {Object.entries(groupedAgents).map(([category, categoryAgents]) => {
                        const IconComponent = getAgentIcon(category);
                        const color = getAgentColor(category);

                        return (
                          <div key={category} className="border-b border-gray-200 last:border-b-0">
                            <div className="p-3 bg-gray-50">
                              <div className="flex items-center">
                                <IconComponent className={`h-4 w-4 text-${color}-600 mr-2`} />
                                <h3 className="text-sm font-medium text-gray-700">
                                  {agentCategories[category] || 'Other Agents'}
                                </h3>
                              </div>
                            </div>
                            <div className="divide-y divide-gray-200">
                              {categoryAgents.map((agent) => (
                                <button
                                  key={agent.name}
                                  onClick={() => handleViewAgent(agent.name)}
                                  className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                                    selectedAgent?.name === agent.name ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full bg-${color}-100 flex items-center justify-center mr-3 flex-shrink-0`}>
                                      <IconComponent className={`h-4 w-4 text-${color}-600`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-sm font-medium text-gray-900 truncate">
                                        {agent.name.replace(/\.md$/, '').replace(/-/g, ' ')}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {agent.expertise || 'Development Agent'}
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Agent Details */}
                <div className="lg:col-span-2">
                  {selectedAgent ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-full bg-${getAgentColor(getAgentCategory(selectedAgent.name))}-100 flex items-center justify-center mr-4`}>
                            {(() => {
                              const IconComponent = getAgentIcon(getAgentCategory(selectedAgent.name));
                              return <IconComponent className={`h-6 w-6 text-${getAgentColor(getAgentCategory(selectedAgent.name))}-600`} />;
                            })()}
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                              {selectedAgent.name.replace(/\.md$/, '').replace(/-/g, ' ')}
                            </h2>
                            <p className="text-gray-600">
                              {selectedAgent.expertise || 'Specialized Development Agent'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Agent Capabilities */}
                      {selectedAgent.capabilities && (
                        <div className="p-6 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900 mb-3">Capabilities</h3>
                          <div className="grid md:grid-cols-2 gap-3">
                            {selectedAgent.capabilities.map((capability, index) => (
                              <div key={index} className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-sm text-gray-700">{capability}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Agent Prompt */}
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Agent Prompt</h3>
                        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                            {selectedAgent.content}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                      <CogIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Select an Agent
                      </h3>
                      <p className="text-gray-600">
                        Choose an AI agent from the list to view its capabilities and prompt structure
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Agent Info */}
            <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">About AI Development Agents</h3>
              <p className="text-purple-800 mb-4">
                These specialized AI agents are designed to work with your BMAD-generated documentation to automate
                various aspects of software development. Each agent has specific expertise and can be used with
                popular AI coding tools.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-purple-900 mb-2">Agent Features</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Context-aware prompts</li>
                    <li>• Project documentation integration</li>
                    <li>• Specialized domain expertise</li>
                    <li>• Compatible with major AI tools</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-purple-900 mb-2">Compatible Tools</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Claude (Anthropic)</li>
                    <li>• ChatGPT (OpenAI)</li>
                    <li>• GitHub Copilot</li>
                    <li>• Cursor IDE</li>
                    <li>• Other AI coding assistants</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
