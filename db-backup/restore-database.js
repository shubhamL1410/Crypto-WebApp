const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function restoreDatabase() {
    const client = new MongoClient('mongodb://localhost:27017');
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('cryptoo');
        const backupDir = './db-backup';
        
        // Check if backup directory exists
        if (!fs.existsSync(backupDir)) {
            console.error('❌ Backup directory not found. Please run backup-database.js first.');
            return;
        }
        
        // Find the latest backup file
        const backupFiles = fs.readdirSync(backupDir)
            .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
            .sort()
            .reverse();
        
        if (backupFiles.length === 0) {
            console.error('❌ No backup files found in db-backup directory.');
            return;
        }
        
        const latestBackup = backupFiles[0];
        const backupPath = path.join(backupDir, latestBackup);
        
        console.log(`📁 Restoring from: ${latestBackup}`);
        
        // Read backup file
        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        
        console.log(`📊 Database: ${backupData.database}`);
        console.log(`📅 Backup Date: ${backupData.timestamp}`);
        console.log(`📦 Collections: ${Object.keys(backupData.collections).length}`);
        
        // Restore each collection
        for (const [collectionName, documents] of Object.entries(backupData.collections)) {
            console.log(`\n🔄 Restoring collection: ${collectionName}`);
            
            // Clear existing data
            await db.collection(collectionName).deleteMany({});
            console.log(`   ✓ Cleared existing data`);
            
            // Insert backup data
            if (documents.length > 0) {
                await db.collection(collectionName).insertMany(documents);
                console.log(`   ✓ Restored ${documents.length} documents`);
            } else {
                console.log(`   ✓ Collection is empty`);
            }
        }
        
        console.log(`\n✅ Database restore completed successfully!`);
        console.log(`📊 Total collections restored: ${Object.keys(backupData.collections).length}`);
        
    } catch (error) {
        console.error('❌ Restore failed:', error);
    } finally {
        await client.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Add command line argument support
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📊 Database Restore Tool

Usage:
  node restore-database.js              # Restore from latest backup
  node restore-database.js --help       # Show this help message

This script will:
1. Connect to MongoDB (mongodb://localhost:27017/cryptoo)
2. Find the latest backup file in ./db-backup/
3. Clear existing data in all collections
4. Restore data from the backup file

⚠️  Warning: This will overwrite all existing data in the database!
`);
    process.exit(0);
}

restoreDatabase();