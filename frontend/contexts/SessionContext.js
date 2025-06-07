import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Get API base URL
const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const SessionContext = createContext();

// Session state management
const initialState = {
  session: null,
  loading: false,
  error: null,
  currentPhase: 'analyst',
  phases: {
    analyst: { completed: false, data: {}, outputs: [] },
    pm: { completed: false, data: {}, outputs: [] },
    architect: { completed: false, data: {}, outputs: [] },
    designArchitect: { completed: false, data: {}, outputs: [] },
    po: { completed: false, data: {}, outputs: [] },
    sm: { completed: false, data: {}, outputs: [] }
  }
};

function sessionReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_SESSION':
      return {
        ...state,
        session: action.payload,
        currentPhase: action.payload?.currentPhase || 'analyst',
        phases: action.payload?.phases || initialState.phases,
        loading: false,
        error: null
      };

    case 'UPDATE_PHASE':
      return {
        ...state,
        phases: {
          ...state.phases,
          [action.payload.phase]: {
            ...state.phases[action.payload.phase],
            ...action.payload.data
          }
        }
      };

    case 'COMPLETE_PHASE':
      return {
        ...state,
        phases: {
          ...state.phases,
          [action.payload.phase]: {
            ...state.phases[action.payload.phase],
            completed: true,
            data: action.payload.data,
            outputs: action.payload.outputs
          }
        },
        currentPhase: action.payload.nextPhase
      };

    case 'RESET_SESSION':
      return initialState;

    default:
      return state;
  }
}

export function SessionProvider({ children }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  // API functions
  const api = {
    async createSession(projectName) {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const apiUrl = getApiUrl();
        const response = await axios.post(`${apiUrl}/api/sessions`, { projectName });
        dispatch({ type: 'SET_SESSION', payload: response.data.data });
        return response.data.data;
      } catch (error) {
        console.error('Session creation error:', error);
        dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to create session' });
        throw error;
      }
    },

    async loadSession(sessionId) {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const apiUrl = getApiUrl();
        const response = await axios.get(`${apiUrl}/api/sessions/${sessionId}`);
        dispatch({ type: 'SET_SESSION', payload: response.data.data });
        return response.data.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to load session' });
        throw error;
      }
    },

    async updateSession(sessionId, updates) {
      try {
        const apiUrl = getApiUrl();
        const response = await axios.put(`${apiUrl}/api/sessions/${sessionId}`, updates);
        dispatch({ type: 'SET_SESSION', payload: response.data.data });
        return response.data.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to update session' });
        throw error;
      }
    },

    async completePhase(sessionId, phase, data, outputs) {
      try {
        const response = await axios.post(`/api/sessions/${sessionId}/phases/${phase}/complete`, {
          data,
          outputs
        });
        dispatch({
          type: 'COMPLETE_PHASE',
          payload: {
            phase,
            data,
            outputs,
            nextPhase: response.data.nextPhase
          }
        });
        return response.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to complete phase' });
        throw error;
      }
    },

    async generatePackage(sessionId) {
      try {
        const response = await axios.post(`/api/generator/package/${sessionId}`);
        return response.data.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to generate package' });
        throw error;
      }
    },

    async getPackagePreview(sessionId) {
      try {
        const response = await axios.post(`/api/generator/preview/${sessionId}`);
        return response.data.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to get preview' });
        throw error;
      }
    }
  };

  // Template and checklist functions
  const templates = {
    async getAll() {
      const response = await axios.get('/api/templates');
      return response.data.data;
    },

    async getByPhase(phase) {
      const response = await axios.get(`/api/templates/by-phase/${phase}`);
      return response.data.data;
    },

    async getSchema(templateName) {
      const response = await axios.get(`/api/templates/${templateName}/schema`);
      return response.data.data;
    },

    async fill(templateName, values) {
      const response = await axios.post(`/api/templates/${templateName}/fill`, { values });
      return response.data.data;
    }
  };

  const checklists = {
    async getAll() {
      const response = await axios.get('/api/checklists');
      return response.data.data;
    },

    async getByPhase(phase) {
      const response = await axios.get(`/api/checklists/by-phase/${phase}`);
      return response.data.data;
    },

    async get(checklistName) {
      const response = await axios.get(`/api/checklists/${checklistName}`);
      return response.data.data;
    },

    async validate(checklistName, responses) {
      const response = await axios.post(`/api/checklists/${checklistName}/validate`, { responses });
      return response.data.data;
    }
  };

  const agents = {
    async getAll() {
      const response = await axios.get('/api/agents');
      return response.data.data;
    },

    async get(agentId) {
      const response = await axios.get(`/api/agents/${agentId}`);
      return response.data.data;
    },

    async getWorkflow(phase) {
      const response = await axios.get(`/api/agents/workflow/${phase}`);
      return response.data.data;
    }
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_ERROR', payload: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  const value = {
    ...state,
    api,
    templates,
    checklists,
    agents,
    dispatch
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
