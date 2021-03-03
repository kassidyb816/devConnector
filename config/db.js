const mongoose = require('mongoose');
const config = require('config'); //use config file
const db = config.get('mongoURI'); //data in the default.json file for application wide use

const connectDB = async () => {
    try {
      await mongoose.connect(db, {
          useNewUrlParser: true,
          useCreateIndex: true
      });
      
      console.log('MongoDB Connected...');
    } catch(err) {
      console.log(err.message);
      // exit the process with failure 
      process.exit(1); 

    }
}
module.exports = connectDB; //method to connect database