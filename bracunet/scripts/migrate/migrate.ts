import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function migrate() {
    try {
        await client.connect();
        const database = client.db('bracunet');
        
        // Example migration: Create an alumni collection
        const alumniCollection = database.collection('alumni');
        const alumniIndexes = await alumniCollection.createIndex({ email: 1 }, { unique: true });
        console.log(`Created index: ${alumniIndexes}`);

        // Add more migrations as needed
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await client.close();
    }
}

migrate();