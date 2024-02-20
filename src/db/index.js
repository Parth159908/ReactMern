import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () =>{
    try {
        const connectionInstance = await  mongoose.connect(`${process.env.MOGODB_URL}/${DB_NAME}`);
        console.log(` MOGODB Connected !! HOST: ${connectionInstance.connection.host}` );
      } catch (error) {
          console.log("MONGO DB CONNECTION FAILED",error);
      }
}

export default connectDb;