declare module 'gridfs-stream' {
    import { MongooseConnectionOptions } from 'mongoose';
    import { Readable, Writable } from 'stream';
  
    function gridfsStream(conn: any, mongo: any): Grid;
  
    interface Grid {
      createWriteStream(options?: {
        _id?: any;
        filename?: string;
        mode?: string;
        chunkSize?: number;
        content_type?: string;
        root?: string;
        metadata?: any;
      }): Writable;
  
      createReadStream(options?: {
        _id?: any;
        filename?: string;
        root?: string;
      }): Readable;
  
      remove(options?: { _id?: any; root?: string }, callback?: (err?: any) => void): void;
    }
  
    export = gridfsStream;
  }
  