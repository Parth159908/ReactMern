import dotenv from "dotenv";
import connectDb from "./db/index.js";
import app from "./app.js";


dotenv.config({
    path:'./.env'
});

const port = process.env.PORT || 8000;
connectDb()
.then(() =>{
    app.on('error', (err) => { // Add the event name 'error'
        console.log("ERROR WHILE CONNECTION TO SERVER:", err);
        throw err;
    });

    app.listen(port || 8000,() =>{
        console.log(`SERVER IS RUNNING ON PORT: ${port}`);
    })
})
.catch((err) => {
    console.log("MOGODB CONNECTION FAILED:",err)
});