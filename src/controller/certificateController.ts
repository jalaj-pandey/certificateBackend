

import { Request, Response, NextFunction } from "express";
import { generateCertificatePDF } from "../utils/generateCertificatePDF";
import { User } from "../model/user";
import { gfs } from "../server";
import path from "path";
import { TryCatch } from "../middlewares/error";
import ErrorHandler from "../types/utility-classes";
import { sendEmail } from "../utils/emailService";


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

    
    const certificateId = `cert-${Date.now()}`;

    
    user.certificates.push({ certificateId, pdfPath });
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
