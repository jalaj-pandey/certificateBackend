import mongoose from 'mongoose'; // Just import mongoose
import gridfsStream from 'gridfs-stream';

let gfs: any;

export const initGridFS = () => {
    const conn = mongoose.connection;

    conn.once('open', () => {
        gfs = gridfsStream(conn.db, mongoose.mongo); // Use mongoose.mongo here
        gfs.collection('certificates'); // Set the collection name
        console.log("GridFS initialized"); // Log to confirm initialization
    });
};

export const getGfs = () => gfs;
