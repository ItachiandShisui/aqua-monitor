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

const filePath =
  process.env.NODE_ENV === "production" ? ["..", "..", "temp"] : ["..", "temp"];

async function saveGVSAnalyze(req: Request, res: Response, payload: string) {
  try {
    await GVSAnalyze.deleteMany({});
    await GVSAnalyze.create(JSON.parse(payload));
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
    const forecastDuration = req.body?.duration.toString() || "168";
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

export async function createHVSITPForecastSheet(req: Request, res: Response) {
  try {
    const GVSCollection = JSON.stringify(await GVS.find());
    const HVSITPCollection = JSON.stringify(await HVSITP.find());
    const forecastDuration = req.body.duration.toString() || "168";
    let pythonOutput = "";

    const pythonProcess = spawn("python", ["./src/scripts/hvs_forecast.py"]);

    pythonProcess.stdin.write(GVSCollection + "\n");
    pythonProcess.stdin.write(HVSITPCollection + "\n");
    pythonProcess.stdin.write(forecastDuration);
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

export async function getGVSAnalyze(req: Request, res: Response) {
  try {
    let totalCount = await GVSAnalyze.countDocuments();
    if (!totalCount) {
      await createGVSAnalyze(req, res);
      return;
    }
    const pageNumber = Number(req.query.pageNumber) || 1;
    const perPage = Number(req.query.perPage) || 25;
    const sheet = await GVSAnalyze.find()
      .sort({ datetime: 1 })
      .skip((pageNumber - 1) * perPage)
      .limit(perPage);
    totalCount = await GVSAnalyze.find().countDocuments();

    return res.status(200).json({ totalSheets: totalCount, data: sheet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function updateHVSITPForecastSheet(req: Request, res: Response) {
  try {
    const editedRow = req.body[0];
    await HVSITPForecast.updateOne(
      { _id: editedRow._id },
      { $set: { delta: editedRow.delta } }
    );

    eraseFile(path.join(__dirname, ...filePath, "GVSForecastOutput.pdf"));

    let rowsErased = "";
    await HVSITPForecast.deleteMany({
      datetime: { $gt: editedRow.datetime },
    }).then((result) => {
      rowsErased = result.deletedCount.toString();
    });

    if (rowsErased && rowsErased !== "0") {
      const GVSCollection = JSON.stringify(await GVS.find());
      const HVSITPCollection = JSON.stringify(await HVSITP.find());
      const HVSITPForecastCollection = JSON.stringify(
        await HVSITPForecast.find()
      );

      const finalHVSITPString =
        HVSITPCollection.slice(0, -1) + "," + HVSITPForecastCollection.slice(1);
      let pythonOutput = "";

      const pythonProcess = spawn("python", ["./src/scripts/hvs_forecast.py"]);

      pythonProcess.stdin.write(GVSCollection + "\n");
      pythonProcess.stdin.write(finalHVSITPString + "\n");
      pythonProcess.stdin.write(rowsErased);
      pythonProcess.stdin.end();

      pythonProcess.stdout.on("data", (data: { toString: () => string }) => {
        pythonOutput += data.toString();
      });

      pythonProcess.on("close", async (code: number) => {
        if (code === 0) {
          await HVSITPForecast.create(JSON.parse(pythonOutput));
          return res
            .status(200)
            .json({ message: "Данные сохранены и прогноз был обновлен" });
        } else {
          res.status(500).send("Python script execution failed.");
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function updateGVSForecastSheet(req: Request, res: Response) {
  try {
    const editedRow = req.body[0];
    await GVSAnalyze.updateOne(
      { _id: editedRow._id },
      { $set: { total: editedRow.total } }
    );

    eraseFile(path.join(__dirname, ...filePath, "GVSForecastOutput.pdf"));
    let rowsErased = "";
    await GVSAnalyze.deleteMany({
      datetime: { $gt: editedRow.datetime },
    }).then((result) => {
      rowsErased = result.deletedCount.toString();
    });

    if (rowsErased && rowsErased !== "0") {
      const GVSCollection = JSON.stringify(await GVS.find());
      const HVSITPCollection = JSON.stringify(await HVSITP.find());
      const HVSITPForecastCollection = JSON.stringify(
        await HVSITPForecast.find()
      );

      const finalHVSITPString =
        HVSITPCollection.slice(0, -1) + "," + HVSITPForecastCollection.slice(1);
      const GVSAnalyzeCollection = JSON.stringify(await GVSAnalyze.find());

      const finalGVSString =
        GVSCollection.slice(0, -1) + "," + GVSAnalyzeCollection.slice(1);
      let pythonOutput = "";

      const pythonProcess = spawn("python", ["./src/scripts/gvs_analyzer.py"]);

      pythonProcess.stdin.write(finalGVSString + "\n");
      pythonProcess.stdin.write(finalHVSITPString + "\n");
      pythonProcess.stdin.write(rowsErased);
      pythonProcess.stdin.end();

      pythonProcess.stdout.on("data", (data: { toString: () => string }) => {
        pythonOutput += data.toString();
      });

      pythonProcess.on("close", async (code: number) => {
        if (code === 0) {
          await GVSAnalyze.create(JSON.parse(pythonOutput));
          return res
            .status(200)
            .json({ message: "Данные сохранены и прогноз был обновлен" });
        } else {
          res.status(500).send("Python script execution failed.");
        }
      });
    }
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
    await HVSITPForecast.deleteMany({});
    await HVSITPForecast.create(JSON.parse(payload));
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
    let totalCount = await HVSITPForecast.countDocuments();

    if (!totalCount) {
      await createHVSITPForecast(req, res);
      return;
    }
    const pageNumber = Number(req.query?.pageNumber) || 1;
    const perPage = Number(req.query?.perPage) || 25;
    const sheet = await HVSITPForecast.find({ forecast: 1 })
      .sort({ datetime: 1 })
      .skip((pageNumber - 1) * perPage)
      .limit(perPage);
    totalCount = await HVSITPForecast.find({ forecast: 1 }).countDocuments();

    return res.status(200).json({ totalSheets: totalCount, data: sheet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function exportHVSITPForecastCollection(
  req: Request,
  res: Response
) {
  const fullPath = path.join(
    __dirname,
    ...filePath,
    "HVSITPForecastOutput.pdf"
  );

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
        "Content-disposition": "attachment;filename=HVSITPForecastOutput.pdf",
      })
      .end(pdfData);
  });
  const pageNumber = Number(req.query.pageNumber) || 1;
  const perPage = Number(req.query.perPage) || 25;
  const sheet = await HVSITPForecast.find({ maintenance: 1 })
    .sort({ datetime: 1 })
    .skip((pageNumber - 1) * perPage)
    .limit(perPage);

  myDoc.pipe(fs.createWriteStream(fullPath));
  myDoc
    .font("Tinos")
    .fontSize(24)
    .text("Прогнозируемая посуточная ведомость водосчетчика ХВС ИТП", {
      align: "center",
    });
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

export async function exportGVSForecastCollection(req: Request, res: Response) {
  const fullPath = path.join(__dirname, ...filePath, "GVSForecastOutput.pdf");

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
        "Content-disposition": "attachment;filename=GVSForecastOutput.pdf",
      })
      .end(pdfData);
  });
  const pageNumber = Number(req.query.pageNumber) || 1;
  const perPage = Number(req.query.perPage) || 25;
  const sheet = await GVSAnalyze.find({ t1: null })
    .sort({ datetime: 1 })
    .skip((pageNumber - 1) * perPage)
    .limit(perPage);

  myDoc.pipe(fs.createWriteStream(fullPath));
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
    const historical = await GVS.find().sort({ datetime: -1 });
    const gvs = await GVSAnalyze.find().sort({ datetime: -1 });
    const hvsitp = await HVSITPForecast.find().sort({ datetime: -1 });

    return res
      .status(200)
      .json({ gvs: gvs, hvsitp: hvsitp, historical: historical });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}
