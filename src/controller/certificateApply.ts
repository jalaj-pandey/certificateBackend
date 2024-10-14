import express, { NextFunction, Request, Response } from "express";
import { newCertificateRequestBody } from "../types/types";
import ErrorHandler from "../types/utility-classes";
import { TryCatch } from "../middlewares/error";
import { myCache } from "../server";
import { sendEmail } from "../utils/emailService";
import { User } from "../model/user";
import { applyForCertificate } from "./certificateController";
import { generateCertificatePDF } from "../utils/generateCertificatePDF";

export const newCertificate = TryCatch(
  async (
    req: Request<{}, {}, newCertificateRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { user, userInfo } = req.body;
    if (!user || !userInfo) {
      return next(new ErrorHandler("Please enter required fields", 400));
    }
    const updatedUser = await User.findOneAndUpdate(
      { _id: user },
      {
        $set: {
          status: "Applied",
          userInfo: userInfo,
        },
      },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return next(new ErrorHandler("User not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Applied successfully",
      user: updatedUser,
    });
  }
);

export const allApplications = TryCatch(async (req, res, next) => {
  const key = `all`;
  let applies = [];
  if (myCache.has(key)) applies = JSON.parse(myCache.get(key) as string);
  else {
    applies = await User.find({ status: { $in: ["Applied", "Accepted", "Rejected"] } })
    .sort({ createdAt: -1 });
    myCache.set(key, JSON.stringify(applies));
  }

  return res.status(200).json({
    success: true,
    applies,
  });
});

export const getSingleRequest = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const key = `apply-${id}`;

  let apply;

  if (myCache.has(key)) apply = JSON.parse(myCache.get(key) as string);
  else {
    apply = await User.findById(id);
    if (!apply) return next(new ErrorHandler("Application Not Found", 404));
    myCache.set(key, JSON.stringify(apply));
  }

  return res.status(200).json({
    success: true,
    apply,
  });
});


interface CertificateResponse {
  success: boolean;
  pdfPath?: string; 
}


export const processApplicationStatus = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return next(
        new ErrorHandler(
          "Invalid status. Status must be 'Accepted' or 'Rejected'",
          400
        )
      );
    }

    const application = await User.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found", 404));
    }

    const previousStatus = application.status;
    application.status = status;
    await application.save();

    if (application.status !== previousStatus) {
      try {
        const userEmail = application.email;
        if (userEmail) {
          if (application.status === "Accepted") {
            const certResponse = await applyForCertificateAutomatically(application._id.toString());

            if (certResponse.success) {
              const isWebDevelopment = application.batch === 'Web Development';
              const certificateId = generateCertificateNumber(isWebDevelopment);

              const pdfPath = await generateCertificatePDF(
                application.name,
                application.batch,
                application.createdAt,
                isWebDevelopment
              );

              await User.findByIdAndUpdate(
                application._id,
                { $set: { certificates: [{ certificateId, pdfPath }] } },
                { new: true }
              );

              const fileName = `certificate_${application.name.replace(/\s+/g, '_')}.pdf`; 
              const relativePath = `certificates/${fileName}`;
              const fullUrl = `https://certificatebackend-mks5.onrender.com/${relativePath}`;

              const htmlContent = `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    color: #333;
                    line-height: 1.6;
                  }
                  h2 {
                    color: #2E86C1;
                  }
                  .status {
                    text-align: center;
                    font-size: 1.2em;
                    color: #27AE60;
                  }
                  .footer {
                    font-size: 0.8em;
                    color: #777;
                  }
                </style>
              </head>
              <body>
                <h2>Application Status Update</h2>
                <p>Dear ${application.name},</p>
                <p>We are excited to inform you that your application has been accepted 🎉 for ${application.batch}'s ${application.role} intern certificate.</p>
                <p class="status">
                  <strong>New Status: <span>${application.status}</span></strong>
                </p>
                <p>Download your certificate <a href="${fullUrl}">here</a>.</p>
                <p>Thank you for your patience. If you have any questions, feel free to reach out to our support team.</p>
                <p>Best regards,</p>
                <p><strong>The Edquest Team</strong></p>
                
                <hr style="border: 0; border-top: 1px solid #ccc;" />
                <p class="footer">Please do not reply to this email. Visit our <a href="https://edquest.com/support">Support Page</a> for further assistance.</p>
              </body>
              </html>
              `;

              await sendEmail(userEmail, "Application Status Update - Edquest", htmlContent);

              return res.status(200).json({
                success: true,
                message: "Application Processed and Certificate Generated Successfully",
                certificateId,
                fullUrl,
              });
            }
          } else {
            const htmlContent = `
            <h2>Application Status Update</h2>
            <p>Dear ${application.name},</p>
            <p>We regret to inform you that your application has been rejected.</p>
            <p>Best regards,</p>
            <p><strong>The Edquest Team</strong></p>
            `;
            await sendEmail(userEmail, "Application Status Update - Edquest", htmlContent);
          }
        } else {
          console.log("No valid email address found for sending notification");
        }
      } catch (error) {
        console.error("Error sending email notification:", error);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Application Processed successfully",
      data: application,
    });
  }
);




const applyForCertificateAutomatically = async (userId: string): Promise<CertificateResponse> => {
  console.log(`Attempting to generate certificate for user ID: ${userId}`);
  
  
  const user = await User.findById(userId);
  if (!user) {
    console.error("User not found");
    return { success: false }; 
  }

  try {
    console.log(`User found: ${user.name}, Batch: ${user.batch}`);
    
    const isWebDevelopment = user.batch === 'Web Development';
    const pdfPath = await generateCertificatePDF(user.name, user.batch, user.createdAt, isWebDevelopment);
    
    console.log(`PDF generated at: ${pdfPath}`);
    
    
    const certificateId = generateCertificateNumber(isWebDevelopment);
    await User.findByIdAndUpdate(
      userId,
      { $set: { certificates: [{ certificateId, pdfPath }] } },  
      { new: true }  
    );    
    await user.save();
    console.log("User certificates updated successfully.");

    return { success: true, pdfPath }; 
  } catch (error) {
    console.error("Error generating certificate:", error);
    return { success: false }; 
  }
};
let webDevelopmentCounter = 1;
let otherCounter = 1;

const generateCertificateNumber = (isWebDevelopment: boolean): string => {
  const prefix = isWebDevelopment ? "EDAI" : "EDWD";
  const year = new Date().getFullYear().toString().slice(-2);

  const counter = isWebDevelopment ? webDevelopmentCounter++ : otherCounter++;
  const certificateNumber = `C${String(counter).padStart(3, "0")}`;

  return `${prefix}-${year}-${certificateNumber}`;
};