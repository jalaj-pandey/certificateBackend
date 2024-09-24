import { NextFunction, Request, Response } from "express";

export type userInfoType = {
  name: String;
  email: String;
  role: String;
  gender: String;
  batch: String;
  phoneNo: String;
};

export interface newCertificateRequestBody {
    user: string;
    userInfo: userInfoType[];
}



export type controllerType = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void | Response<any, Record<string, any>>>;