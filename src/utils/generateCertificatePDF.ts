import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

let webDevelopmentCounter = 1;
let otherCounter = 1;

const generateCertificateNumber = (isWebDevelopment: boolean): string => {
  const prefix = isWebDevelopment ? "EDAI" : "EDWD";
  const year = new Date().getFullYear().toString().slice(-2);

  const counter = isWebDevelopment ? webDevelopmentCounter++ : otherCounter++;
  const certificateNumber = `C${String(counter).padStart(3, "0")}`;

  return `${prefix}-${year}-${certificateNumber}`;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

export const generateCertificatePDF = async (
  name: string,
  branch: string,
  date: Date,
  isWebDevelopment: boolean
) => {
  const imagePath = path.join(__dirname, "../assets/cert.png");
  const imageBytes = fs.readFileSync(imagePath);

  const pdfDoc = await PDFDocument.create();

  pdfDoc.registerFontkit(fontkit);

  const backgroundImage = await pdfDoc.embedPng(imageBytes);
  const backgroundDims = backgroundImage.scale(1);

  const page = pdfDoc.addPage([backgroundDims.width, backgroundDims.height]);

  page.drawImage(backgroundImage, {
    x: 0,
    y: 0,
    width: backgroundDims.width,
    height: backgroundDims.height,
  });

  const fontPath = path.join(__dirname, "../assets/AlexBrush-Regular.ttf");
  const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const fontBytes = fs.readFileSync(fontPath);
  const customFont = await pdfDoc.embedFont(fontBytes);

  const fontPaths = path.join(__dirname, "../assets/AlegreyaSans-Bold.ttf");
  const fontBytess = fs.readFileSync(fontPaths);
  const customFontt = await pdfDoc.embedFont(fontBytess);

  const textColor = rgb(0, 0, 0);

  const nameX = 800;
  const nameY = 700;
  const branchX = 650;
  const branchY = 557;
  const nameeX = 800;
  const nameeY = 607;
  const dateX = 800;
  const dateY = 607;
  const certNumberX = 1450;
  const certNumberY = 330;

  const certificateNumber = generateCertificateNumber(isWebDevelopment);

  page.drawText(name, {
    x: nameX,
    y: nameY,
    size: 96,
    font: customFont,
    color: textColor,
  });

  page.drawText(name, {
    x: nameeX,
    y: nameeY,
    size: 30,
    font: customFontt,
    color: textColor,
  });

  page.drawText(branch, {
    x: branchX,
    y: branchY,
    size: 30,
    font: customFontt,
    color: textColor,
  });

  page.drawText(certificateNumber, {
    x: certNumberX,
    y: certNumberY,
    size: 30,
    font: font,
    color: textColor,
  });

  const formattedStartDate = formatDate(date);
  const formattedEndDate = formatDate(addMonths(date, 3));

  const dateRange = `${formattedStartDate} To ${formattedEndDate}`;

  const pdfBytes = await pdfDoc.save();

  const pdfPath = `./certificates/certificate_${name.replace(/ /g, "_")}.pdf`;
  fs.writeFileSync(pdfPath, pdfBytes);

  return pdfPath;
};
