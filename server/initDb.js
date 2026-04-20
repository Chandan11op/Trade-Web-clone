const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import Models
const Admin = require('./models/Admin');
const User = require('./models/User');
const Trade = require('./models/Trade');
const LedgerEntry = require('./models/LedgerEntry');
const AllocationTrade = require('./models/AllocationTrade');
const Contact = require('./models/Contact');
const DailyPriceFlag = require('./models/DailyPriceFlag');
const Rule = require('./models/Rule');

const initDb = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected successfully.');

        console.log('Ensuring collections are created...');
        
        // Mongoose creates collections when you first save a document or explicitly call createCollection
        const models = [Admin, User, Trade, LedgerEntry, AllocationTrade, Contact, DailyPriceFlag, Rule];
        for (const model of models) {
            await model.createCollection();
            console.log(`- Collection for ${model.modelName} ensured.`);
        }

        // Create a default Admin if none exists
        const existingAdmin = await Admin.findOne({ mob_num: '1234567890' });
        if (!existingAdmin) {
            console.log('Admin not found. Creating default admin...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await Admin.create({
                user_name: 'Super Admin',
                mob_num: '1234567890',
                password: hashedPassword,
                role: 'admin',
                current_balance: 0,
                contact_details: { email: 'admin@example.com' }
            });
            console.log('Default Admin created: 1234567890 / admin123');
        } else {
            console.log('Admin already exists.');
        }

        // Create a default User if none exists
        const existingUser = await User.findOne({ mob_num: '8879753917' });
        if (!existingUser) {
            console.log('User not found. Creating default user...');
            const hashedPassword = await bcrypt.hash('chandan', 10);
            await User.create({
                user_name: 'Chandan',
                mob_num: '8879753917',
                password: hashedPassword,
                role: 'user',
                status: 'active',
                current_balance: 1000, // Giving some initial balance for testing
                client_id: 'CID887975'
            });
            console.log('Default User created: 8879753917 / chandan');
        } else {
            console.log('User already exists.');
        }

        console.log('Database initialization complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error during DB initialization:', error);
        process.exit(1);
    }
};

initDb();
