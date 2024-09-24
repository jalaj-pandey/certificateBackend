import express from "express"
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/dbConfig'
import userRoutes from "./routes/user";
import certificateApply from './routes/certificateApply'
import NodeCache from "node-cache";
dotenv.config();
connectDB()

export const myCache = new NodeCache();

const port = process.env.PORT || 5001;
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.use("/api/users", userRoutes);
app.use("/api/apply", certificateApply);

app.get("/",(req,res)=>{
    res.send("yea workinggg")
})

app.listen(port, ()=>{
    console.log(`server listening on port ${port}`);
})