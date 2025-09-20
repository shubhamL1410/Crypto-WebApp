const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function backupDatabase() {
    const client = new MongoClient('mongodb://localhost:27017');
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('cryptoo');
        const collections = await db.listCollections().toArray();
        
        const backupDir = './db-backup';
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const backupData = {
            database: 'cryptoo',
            timestamp: new Date().toISOString(),
            collections: {}
        };
        
        for (const collection of collections) {
            const collectionName = collection.name;
            console.log(`Backing up collection: ${collectionName}`);
            
            const data = await db.collection(collectionName).find({}).toArray();
            backupData.collections[collectionName] = data;
            
            console.log(`✓ Backed up ${data.length} documents from ${collectionName}`);
        }
        
        // Save backup to JSON file
        const backupFile = path.join(backupDir, `backup-${new Date().toISOString().split('T')[0]}.json`);
        fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
        
        console.log(`\n✅ Database backup completed successfully!`);
        console.log(`📁 Backup saved to: ${backupFile}`);
        console.log(`📊 Total collections backed up: ${collections.length}`);
        
        // Also create individual collection files
        for (const collection of collections) {
            const collectionName = collection.name;
            const collectionFile = path.join(backupDir, `${collectionName}.json`);
            fs.writeFileSync(collectionFile, JSON.stringify(backupData.collections[collectionName], null, 2));
            console.log(`📄 Individual file: ${collectionFile}`);
        }
        
    } catch (error) {
        console.error('❌ Backup failed:', error);
    } finally {
        await client.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}

backupDatabase();
