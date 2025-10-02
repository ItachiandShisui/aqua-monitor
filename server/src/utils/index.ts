import fs from "fs";

export async function eraseFile(filePath: string) {
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      if (err.code === "ENOENT") {
        console.log("File does not exist, no need to unlink.");
      } else {
        console.error("Error checking file existence:", err);
      }
      return;
    }

    fs.unlink(filePath, (error) => {
      if (error) {
        console.error("Error unlinking file:", error);
        return;
      }
    });
  });
}
