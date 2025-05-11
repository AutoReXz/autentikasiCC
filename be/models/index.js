import sequelize from '../config/database.js';
import Note from './note.js';
import User from './user.js';

// Associate User with Notes
const setupAssociations = () => {
    User.hasMany(Note, { foreignKey: 'userId', as: 'notes' });
    Note.belongsTo(User, { foreignKey: 'userId', as: 'user' });
};

/**
 * Initialize models and sync them with the MySQL database on GCP
 */
const initModels = async () => {
    try {
        setupAssociations();
        await sequelize.sync({ alter: true }); // Use alter:true to make changes without dropping tables
        console.log('MySQL database models synchronized successfully');
    } catch (error) {
        console.error('Error syncing MySQL database models:', error);
        throw error;
    }
};

export {
    initModels,
    Note,
    User
};
