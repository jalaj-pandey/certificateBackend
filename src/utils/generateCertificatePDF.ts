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

const wrapText = (text: string, maxWidth: number, font: any, fontSize: number): string[] => {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine + (currentLine ? " " : "") + word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

export const generateCertificatePDF = async (
  name: string,
  branch: string,
  date: Date,
  isWebDevelopment: boolean
) => {
  
  const imagePath = path.join(__dirname, "../utils/cert.png");
  const fontPath = path.join(__dirname, "../utils/AlexBrush-Regular.ttf");
  const fontPaths = path.join(__dirname, "../utils/AlegreyaSans-Bold.ttf");

  
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image file not found at path: ${imagePath}`);
  }
  if (!fs.existsSync(fontPath)) {
    throw new Error(`Font file not found at path: ${fontPath}`);
  }
  if (!fs.existsSync(fontPaths)) {
    throw new Error(`Font file not found at path: ${fontPaths}`);
  }

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

  const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontBytes = fs.readFileSync(fontPath);
  const customFont = await pdfDoc.embedFont(fontBytes);

  const fontBytess = fs.readFileSync(fontPaths);
  const customFontt = await pdfDoc.embedFont(fontBytess);

  const textColor = rgb(0, 0, 0);
  const nameX = 800;
  const nameY = 700;
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

  page.drawText(certificateNumber, {
    x: certNumberX,
    y: certNumberY,
    size: 30,
    font: font,
    color: textColor,
  });

  const contentText = `This is to certify that ${name} has successfully completed a 4-month internship as a ${branch} at Edquest. During his tenure, he demonstrated outstanding technical skills, creativity, and dedication, contributing significantly to our AI projects. We commend his excellent work and wish him the best in his future endeavors.`;

  const fontSize = 30;
  const lineSpacing = 20;
  const textY = 600;
  const pageWidth = page.getWidth();
  const maxTextWidth = pageWidth - 600;

  const wrappedTextLines = wrapText(contentText, maxTextWidth, customFontt, fontSize);

  wrappedTextLines.forEach((line, index) => {
    const textWidth = customFontt.widthOfTextAtSize(line, fontSize);
    const textX = (pageWidth - textWidth) / 2;

    page.drawText(line, {
      x: textX,
      y: textY - index * (fontSize + lineSpacing),
      size: fontSize,
      font: customFontt,
      color: textColor,
    });
  });

  const formattedStartDate = formatDate(date);
  const formattedEndDate = formatDate(addMonths(date, 3));
  const dateRange = `${formattedStartDate} To ${formattedEndDate}`;

  const pdfBytes = await pdfDoc.save();

  
  const pdfDirectory = path.resolve(__dirname, './dist/utils/certificates');
  if (!fs.existsSync(pdfDirectory)) {
    fs.mkdirSync(pdfDirectory, { recursive: true });
  }

  const pdfPath = path.join(pdfDirectory, `certificate_${name.replace(/ /g, "_")}.pdf`);
  fs.writeFileSync(pdfPath, pdfBytes);

  return pdfPath;
};
