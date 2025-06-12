const { sequelize } = require('../config/database');
const User = require('./User');
const Session = require('./Session');

// Define associations
User.hasMany(Session, {
  foreignKey: 'userId',
  as: 'sessions',
  onDelete: 'SET NULL' // Keep sessions even if user is deleted
});

Session.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Sync database (create tables if they don't exist)
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    throw error;
  }
};

// Initialize database
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync models in development
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase(false); // Don't force in development
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  User,
  Session,
  syncDatabase,
  initializeDatabase
};
