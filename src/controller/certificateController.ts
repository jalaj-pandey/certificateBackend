

import { NextFunction, Request, Response } from "express";
import { User } from "../model/user";
import { generateCertificatePDF } from "../utils/generateCertificatePDF";


const generatedCertificates: {
  [key: string]: {
    name: string;
    batch: string;
    createdAt: NativeDate;
    id: string;
  };
} = {};

export const applyForCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.body;

  try {
    
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    
    const pdfPath = await generateCertificatePDF(
      user.name,
      user.batch,
      user.createdAt,
      user.isWebDevelopment
    );

    const isWebDevelopment = user.batch === 'Web Development';
    const certificateId = generateCertificateNumber(isWebDevelopment);

    
    await User.findByIdAndUpdate(
      userId,
      { $set: { certificates: [{ certificateId, pdfPath }] } },  
      { new: true }  
    ); 
    await user.save(); 

    
    res.status(200).json({
      success: true,
      message: "Certificate generated successfully",
      certificateId,
      pdfPath,
    });
  } catch (error) {
    next(error); 
  }
};

export const getCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, certificateId } = req.params;

  try {
    
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    
    const certificate = user.certificates.find(
      (cert) => cert.certificateId === certificateId
    );
    if (!certificate || !certificate.pdfPath) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    const pdfPath = `http:
      certificate.pdfPath
    )}`;

    
    res.status(200).json({
      success: true,
      message: "Certificate found",
      pdfPath: pdfPath,
    });
  } catch (error) {
    next(error); 
  }
};

let webDevelopmentCounter = 1;
let otherCounter = 1;

const generateCertificateNumber = (isWebDevelopment: boolean): string => {
  const prefix = isWebDevelopment ? "EDWD" : "EDAI";
  const year = new Date().getFullYear().toString().slice(-2);

  const counter = isWebDevelopment ? webDevelopmentCounter++ : otherCounter++;
  const certificateNumber = `C${String(counter).padStart(3, "0")}`;

  return `${prefix}-${year}-${certificateNumber}`;
};