

import { NextFunction, Request, Response } from "express";
import { User } from "../model/user";



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

    
    
    await User.findByIdAndUpdate(
      userId,
      { new: true }  
    ); 
    await user.save(); 

    
    res.status(200).json({
      success: true,
      message: "Certificate applied successfully",
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

