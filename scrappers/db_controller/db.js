const mongoose = require('mongoose') ;

async function connectToDB() {
    const dbURI = 'mongodb://localhost:27017/intellinews-db'; 
  
    try {
      await mongoose.connect(dbURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
     
      });
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }

async function insertData(fn, schema) {
    try {
      const data = await fn ;
      await schema.create(data);
      console.log('Data inserted successfully!');
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }

  async function cleanDuplicates(collectionName) {
    try {
     
      const collection = mongoose.connection.collection(collectionName);
  
      const field = collectionName === 'articles' ? 'headline' : (collectionName === 'podcasts' ? 'title' : null);
  
      if (!field) {
        console.error('Invalid collection name. Use "articles" or "podcasts".');
        return;
      }
  
      const duplicates = await collection.aggregate([
        { $group: {
            _id: `$${field}`,
            count: { $sum: 1 },
            docs: { $push: "$_id" }
          }
        },
        { $match: { count: { $gt: 1 } } }
      ]).toArray();
  
      for (const doc of duplicates) {
        const [keepId, ...removeIds] = doc.docs;
        await collection.deleteMany({ _id: { $in: removeIds } });
      }
  
      console.log('Duplicates removed successfully!');
    } catch (error) {
      console.error('Error cleaning duplicates:', error);
    } finally {
      mongoose.connection.close();
    }
  }
  
  module.exports = {connectToDB ,insertData ,cleanDuplicates} ;