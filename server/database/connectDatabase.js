require("dotenv").config();

const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {

    

    await mongoose.connect(process.env.MONGO_DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });


    console.log("The database was connected successfully");
  } catch (error) {
    console.error("There was a problem connecting the database:", error);
  }
};

module.exports = connectDatabase;
