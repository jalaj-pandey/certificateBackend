import express, { NextFunction, Request, Response } from "express";
import { newCertificateRequestBody } from "../types/types";
import ErrorHandler from "../types/utility-classes";
import { Apply } from "../model/certificateApply";
import { TryCatch } from "../middlewares/error";
import { myCache } from "../server";
import { sendEmail } from "../utils/emailService";
import { User } from "../model/user";

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
          status: 'Applied',
          userInfo: userInfo,  
        } 
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
    applies = await User.find().sort({ createdAt: -1 });
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





export const processApplicationStatus = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;
  
    if (!['Accepted', 'Rejected'].includes(status)) {
      return next(new ErrorHandler("Invalid status. Status must be 'Accepted' or 'Rejected'", 400));
    }
  
    const application = await User.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found", 404));
    }
  
    const previousStatus = application.status;
    application.status = status;
    await application.save();
  
    // Sending email if status changed
    if (application.status !== previousStatus) {
      try {
        const userEmail = application.email; 
        if (userEmail) {
          const htmlContent: string = `
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
            <p>We are excited to inform you that the status of your application has been updated 🎉 for ${application.batch}'s ${application.role} intern certificate.</p>
            <p class="status">
              <strong>New Status: <span>${application.status}</span></strong>
            </p>
            <p>Thank you for your patience and understanding throughout this process. If you have any questions or need further assistance, please don't hesitate to reach out to our support team. We're here to help! 😊</p>
            <p>Best regards,</p>
            <p><strong>The Edquest Team</strong></p>
            
            <hr style="border: 0; border-top: 1px solid #ccc;" />
            <p class="footer">Please do not reply to this email. If you need to contact us, visit our <a href="https://thejalaj.netlify.app/" style="color: #2E86C1;">support page</a>.</p>
          </body>
          </html>
        `;
  
          await sendEmail(userEmail, 'Application Status Update - Edquest', htmlContent);
          console.log('Email sent successfully');
        } else {
          console.log('No valid email address found for sending notification');
        }
      } catch (error) {
        console.error('Error sending email notification:', error);
      }
    }
  
    return res.status(200).json({
      success: true,
      message: "Application Processed successfully",
      data: application
    });
  });