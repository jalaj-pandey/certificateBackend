import express, { Request, Response, NextFunction }  from "express"
import gridfsStream from 'gridfs-stream';
import { GridFsStorage } from 'multer-gridfs-storage';
import multer from 'multer';
import { initGridFS } from './gridfs';
import fs from 'fs';
import pdf from 'html-pdf';
import path from 'path';
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/dbConfig'
import userRoutes from "./routes/user";
import certificateApply from './routes/certificateApply'
import NodeCache from "node-cache";
import mongoose from 'mongoose';
dotenv.config();
connectDB()
initGridFS();

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
app.use('/certificates', express.static(path.resolve(__dirname, '../certificates')));


export let gfs: any;
const conn = mongoose.connection;
conn.once('open', () => {
    gfs = gridfsStream(conn.db, mongoose.mongo);
    gfs.collection('certificates'); 
    console.log("GridFS initialized");
});

const storage = new GridFsStorage({
    url: process.env.CONNECTION_STRING as string, 
    file: (req, file) => {
      return {
          bucketName: 'certificates',
          filename: `${Date.now()}-certificate-${file.originalname}`,
      };
  },
  });
  
  const upload = multer({ storage });


app.listen(port, ()=>{
    console.log(`server listening on port ${port}`);
})