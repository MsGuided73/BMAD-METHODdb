const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // Allow anonymous sessions for now
    references: {
      model: 'users',
      key: 'id'
    }
  },
  projectName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  currentPhase: {
    type: DataTypes.ENUM('analyst', 'pm', 'architect', 'designArchitect', 'po', 'sm', 'completed'),
    defaultValue: 'analyst'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'archived', 'deleted'),
    defaultValue: 'active'
  },
  // Phase completion tracking
  phases: {
    type: DataTypes.JSON,
    defaultValue: {
      analyst: { completed: false, data: {}, outputs: [] },
      pm: { completed: false, data: {}, outputs: [] },
      architect: { completed: false, data: {}, outputs: [] },
      designArchitect: { completed: false, data: {}, outputs: [] },
      po: { completed: false, data: {}, outputs: [] },
      sm: { completed: false, data: {}, outputs: [] }
    }
  },
  globalData: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  generatedFiles: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  // Sharing and collaboration
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  shareToken: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  // Metadata
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  lastAccessedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'sessions',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['current_phase']
    },
    {
      fields: ['share_token']
    }
  ]
});

// Instance methods
Session.prototype.updateLastAccessed = function() {
  this.lastAccessedAt = new Date();
  return this.save();
};

Session.prototype.completePhase = function(phase, data = {}, outputs = []) {
  if (!this.phases[phase]) {
    throw new Error(`Invalid phase: ${phase}`);
  }

  this.phases[phase] = {
    completed: true,
    data: data || {},
    outputs: outputs || [],
    completedAt: new Date().toISOString()
  };

  // Update global data with phase data
  if (data) {
    Object.assign(this.globalData, data);
  }

  // Determine next phase
  const phaseOrder = ['analyst', 'pm', 'architect', 'designArchitect', 'po', 'sm'];
  const currentIndex = phaseOrder.indexOf(phase);
  const nextPhase = currentIndex < phaseOrder.length - 1 ? phaseOrder[currentIndex + 1] : 'completed';
  
  this.currentPhase = nextPhase;
  
  if (nextPhase === 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  }

  this.changed('phases', true);
  this.changed('globalData', true);
  
  return this.save();
};

Session.prototype.getCompletionPercentage = function() {
  const phases = Object.values(this.phases);
  const completedPhases = phases.filter(phase => phase.completed).length;
  return Math.round((completedPhases / phases.length) * 100);
};

Session.prototype.generateShareToken = function() {
  const crypto = require('crypto');
  this.shareToken = crypto.randomBytes(32).toString('hex');
  return this.save();
};

Session.prototype.toJSON = function() {
  const values = { ...this.get() };
  // Add computed fields
  values.completionPercentage = this.getCompletionPercentage();
  return values;
};

module.exports = Session;
