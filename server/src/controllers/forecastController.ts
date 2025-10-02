import type { Request, Response } from "express";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import { spawn } from "child_process";
import HVSITP from "../models/HVSITP";
import GVS from "../models/GVS";
import GVSAnalyze from "../models/GVSAnalyze";
import HVSITPForecast from "../models/HTSITPForecast";
import { eraseFile } from "../utils";
import { IGVSAnalize } from "../types/sheets";

async function saveGVSAnalyze(req: Request, res: Response, payload: string) {
  try {
    await GVSAnalyze.deleteMany({});
    await GVSAnalyze.create(JSON.parse(payload), {
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
    getGVSAnalyze(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function createGVSAnalyze(req: Request, res: Response) {
  try {
    const GVSCollection = JSON.stringify(await GVS.find());
    const HVSITPCollection = JSON.stringify(await HVSITP.find());
    const forecastDuration = req.body.duration.toString() || "168";
    let pythonOutput = "";

    const pythonProcess = spawn("python", ["./src/scripts/gvs_analyzer.py"]);

    pythonProcess.stdin.write(GVSCollection + "\n");
    pythonProcess.stdin.write(HVSITPCollection + "\n");
    pythonProcess.stdin.write(forecastDuration);
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", (data: { toString: () => string }) => {
      pythonOutput += data.toString();
    });

    pythonProcess.on("close", (code: number) => {
      if (code === 0) {
        saveGVSAnalyze(req, res, pythonOutput);
      } else {
        res.status(500).send("Python script execution failed.");
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function getGVSAnalyze(req: Request, res: Response) {
  try {
    let totalCount = await GVSAnalyze.countDocuments();
    if (!totalCount) {
      await createGVSAnalyze(req, res);
      return;
    }
    const pageNumber = Number(req.query.pageNumber) || 1;
    const perPage = Number(req.query.perPage) || 25;
    const sheet = await GVSAnalyze.find({ t1: null })
      .sort({ datetime: 1 })
      .skip((pageNumber - 1) * perPage)
      .limit(perPage);
    totalCount = await GVSAnalyze.find({ t1: null }).countDocuments();

    return res.status(200).json({ totalSheets: totalCount, data: sheet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function updateGVSForecastSheet(req: Request, res: Response) {
  try {
    req.body.forEach(async ({ _id, total }: IGVSAnalize) => {
      await GVSAnalyze.updateOne({ _id: _id }, { $set: { total: total } });
    });
    eraseFile(path.join(__dirname, "..", "temp", "GVSForecastOutput.pdf"));

    return res.status(200).json({ message: "Данные сохранены" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

async function saveHVSITPForecast(
  req: Request,
  res: Response,
  payload: string
) {
  try {
    await HVSITPForecast.create(JSON.parse(payload), {
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
    getHVSITPForecast(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function createHVSITPForecast(req: Request, res: Response) {
  try {
    const GVSCollection = JSON.stringify(await GVS.find());
    const HVSITPCollection = JSON.stringify(await HVSITP.find());
    let pythonOutput = "";

    const pythonProcess = spawn("python", ["./src/scripts/hvs_forecast.py"]);

    pythonProcess.stdin.write(GVSCollection + "\n");
    pythonProcess.stdin.write(HVSITPCollection + "\n");
    pythonProcess.stdin.write("48");
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", (data: { toString: () => string }) => {
      pythonOutput += data.toString();
    });

    pythonProcess.on("close", (code: number) => {
      if (code === 0) {
        saveHVSITPForecast(req, res, pythonOutput);
      } else {
        res.status(500).send("Python script execution failed.");
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function getHVSITPForecast(req: Request, res: Response) {
  try {
    const totalCount = await HVSITPForecast.countDocuments();

    if (!totalCount) {
      await createHVSITPForecast(req, res);
      return;
    }
    const sheet = await HVSITPForecast.find();

    res.status(200).send(sheet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function exportGVSForecastCollection(req: Request, res: Response) {
  const filePath = path.join(__dirname, "..", "temp", "GVSForecastOutput.pdf");

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
  const sheet = await GVSAnalyze.find({ t1: null })
    .sort({ datetime: 1 })
    .skip((pageNumber - 1) * perPage)
    .limit(perPage);

  myDoc.pipe(fs.createWriteStream(filePath));
  myDoc
    .font("Tinos")
    .fontSize(24)
    .text("Прогнозируемая посуточная ведомость ОДПУ ГВС", { align: "center" });
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

export async function getIncidents(req: Request, res: Response) {
  try {
    const sheet = await GVSAnalyze.find({}).sort({ datetime: -1 });

    return res.status(200).json(sheet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}
