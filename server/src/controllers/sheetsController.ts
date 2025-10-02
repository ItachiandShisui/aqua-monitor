import type { Request, Response, NextFunction } from "express";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import HVSITP from "../models/HVSITP";
import GVS from "../models/GVS";
import type { IHVSITP, IGVS } from "../types/sheets";
import { eraseFile } from "../utils";

export async function getHVSITPSheet(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const totalCount = await HVSITP.countDocuments();
    const pageNumber = Number(req.query.pageNumber) || 1;
    const perPage = Number(req.query.perPage) || 25;
    const sheet = await HVSITP.find()
      .sort({ total: 1 })
      .skip((pageNumber - 1) * perPage)
      .limit(perPage);

    return res.status(200).json({ totalSheets: totalCount, data: sheet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
    next(error);
  }
}

export async function createHVSITPSheet(req: Request, res: Response) {
  try {
    await HVSITP.create(req.body, {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["date"],
          properties: {
            myField: {
              bsonType: "string",
            },
          },
        },
      },
    });
    eraseFile(path.join(__dirname, "..", "temp", "HVSITPoutput.pdf"));

    return res.status(201).json({ message: "Данные добавлены" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function updateHVSITPSheet(req: Request, res: Response) {
  try {
    req.body.forEach(async ({ _id, delta }: IHVSITP) => {
      await HVSITP.updateOne({ _id: _id }, { $set: { delta: delta } });
    });
    eraseFile(path.join(__dirname, "..", "temp", "HVSITPoutput.pdf"));

    return res.status(200).json({ message: "Данные сохранены" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function getGVSSheet(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const totalCount = await GVS.countDocuments();
    const pageNumber = Number(req.query.pageNumber) || 1;
    const perPage = Number(req.query.perPage) || 25;
    const sheet = await GVS.find()
      .sort({ datetime: 1 })
      .skip((pageNumber - 1) * perPage)
      .limit(perPage);

    return res.status(200).json({ totalSheets: totalCount, data: sheet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
    next(error);
  }
}

export async function createGVSSheet(req: Request, res: Response) {
  try {
    await GVS.create(req.body, {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["date"],
          properties: {
            myField: {
              bsonType: "string",
            },
          },
        },
      },
    });
    eraseFile(path.join(__dirname, "..", "temp", "GVSoutput.pdf"));

    return res.status(201).json({ message: "Данные добавлены" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function updateGVSSheet(req: Request, res: Response) {
  try {
    req.body.forEach(async ({ _id, total }: IGVS) => {
      await GVS.updateOne({ _id: _id }, { $set: { total: total } });
    });
    eraseFile(path.join(__dirname, "..", "temp", "GVSoutput.pdf"));

    return res.status(200).json({ message: "Данные сохранены" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function exportGVSCollection(req: Request, res: Response) {
  const filePath = path.join(__dirname, "..", "temp", "GVSoutput.pdf");

  const myDoc = new PDFDocument({ bufferPages: true });
  myDoc.registerFont("Tinos", "./src/fonts/Tinos.ttf");

  let buffers = [] as Uint8Array<ArrayBufferLike>[];
  myDoc.on("data", buffers.push.bind(buffers));
  myDoc.on("end", () => {
    let pdfData = Buffer.concat(buffers);

    res
      .writeHead(200, {
        "Content-Length": Buffer.byteLength(pdfData),
        "Content-Type": "application/pdf",
        "Content-disposition": "attachment;filename=GVSoutput.pdf",
      })
      .end(pdfData);
  });
  const pageNumber = Number(req.query.pageNumber) || 1;
  const perPage = Number(req.query.perPage) || 25;
  const sheet = await GVS.find({})
    .sort({ datetime: 1 })
    .skip((pageNumber - 1) * perPage)
    .limit(perPage);

  myDoc.pipe(fs.createWriteStream(filePath));
  myDoc
    .font("Tinos")
    .fontSize(24)
    .text("Посуточная ведомость ОДПУ ГВС", { align: "center" });
  myDoc.moveDown();

  const tableStructure = {
    date: "Дата",
    time: "Время суток, ч",
    to: "Подача, м3",
    out: "Обратка, м3",
    total: "Потребление за период, м3",
    t1: "Т1 гвс, оС",
    t2: "Т2 гвс, оС",
  };
  const tableData = sheet.map((item) => {
    return Object.keys(tableStructure).map((field) =>
      field === "date"
        ? new Date(item[field as keyof typeof item]).toLocaleDateString("ru-RU")
        : item[field as keyof typeof item]
    );
  });

  myDoc
    .font("Tinos")
    .fontSize(12)
    .table({ data: [Object.values(tableStructure), ...tableData] });
  myDoc.moveDown();

  myDoc.end();
}

export async function exportHVSITPCollection(req: Request, res: Response) {
  const filePath = path.join(__dirname, "..", "temp", "HVSITPoutput.pdf");

  const myDoc = new PDFDocument({ bufferPages: true });
  myDoc.registerFont("Tinos", "./src/fonts/Tinos.ttf");

  let buffers = [] as Uint8Array<ArrayBufferLike>[];

  myDoc.on("data", buffers.push.bind(buffers));
  myDoc.on("end", () => {
    let pdfData = Buffer.concat(buffers);
    res
      .writeHead(200, {
        "Content-Length": Buffer.byteLength(pdfData),
        "Content-Type": "application/pdf",
        "Content-disposition": "attachment;filename=HVSITPoutput.pdf",
      })
      .end(pdfData);
  });
  const pageNumber = Number(req.query.pageNumber) || 1;
  const perPage = Number(req.query.perPage) || 25;
  const sheet = await HVSITP.find({})
    .sort({ datetime: 1 })
    .skip((pageNumber - 1) * perPage)
    .limit(perPage);

  myDoc.pipe(fs.createWriteStream(filePath));
  myDoc
    .font("Tinos")
    .fontSize(24)
    .text("Посуточная ведомость водосчетчика ХВС ИТП", { align: "center" });
  myDoc.moveDown();

  const tableStructure = {
    date: "Дата",
    time: "Время суток, ч",
    total: "Потребление накопленным итогом, м3",
    delta: "Потребление за период, м3",
  };
  const tableData = sheet.map((item) => {
    return Object.keys(tableStructure).map((field) =>
      field === "date"
        ? new Date(item[field as keyof typeof item]).toLocaleDateString("ru-RU")
        : item[field as keyof typeof item]
    );
  });

  myDoc
    .font("Tinos")
    .fontSize(12)
    .table({ data: [Object.values(tableStructure), ...tableData] });
  myDoc.moveDown();

  myDoc.end();
}
