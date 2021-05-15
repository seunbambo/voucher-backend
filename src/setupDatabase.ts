import mongoose from "mongoose";
require("dotenv").config();

async function databaseSetUp() {
  const connected: boolean = await connectToDatabase();
  if (!connected) {
    process.exit(1);
  }
}

async function connectToDatabase(): Promise<boolean> {
  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    await mongoose.connect(`${process.env.MONGO_DB}`, connectionOptions);
    // await mongoose.connect(`mongodb://localhost/voucher`, connectionOptions);
    console.log("Connected to database");
    return true;
  } catch (error) {
    console.log("Error occured while connecting to database", error);
    return false;
  }
}

export { databaseSetUp };
