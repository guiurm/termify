import { promises as fs } from "fs";
import { dirname, join } from "path";

async function renameFilesAndUpdateImports(directoryPath, extension) {
    try {
        const files = await fs.readdir(directoryPath, { withFileTypes: true });

        for (const file of files) {
            const fullPath = join(directoryPath, file.name);

            if (file.isDirectory()) {
                await renameFilesAndUpdateImports(fullPath, extension);
            } else {
                if (file.name.endsWith(".js")) {
                    // Renombrar el archivo
                    const newFileName = file.name.replace(/\.js$/, extension);
                    const newFilePath = join(directoryPath, newFileName);

                    await fs.rename(fullPath, newFilePath);
                    console.log(`Renamed: ${fullPath} -> ${newFilePath}`);

                    // Modificar las importaciones
                    const fileContent = await fs.readFile(newFilePath, "utf8");

                    const updatedContent = fileContent.replace(/import\s+['"](.*?\.js)['"]/g, (match, importPath) => {
                        const importFullPath = join(directoryPath, importPath);
                        const importDir = dirname(importFullPath);

                        if (importDir === directoryPath) {
                            const newImportPath = importPath.replace(/\.js$/, extension);
                            return match.replace(importPath, newImportPath);
                        }

                        return match;
                    });

                    await fs.writeFile(newFilePath, updatedContent, "utf8");
                    console.log(`Updated imports in: ${newFilePath}`);
                }
            }
        }
    } catch (err) {
        console.error("Error al procesar los archivos:", err);
    }
}

// Definir las rutas de los directorios
const cjsDirectoryPath = "./dist/cjs";
const mjsDirectoryPath = "./dist/mjs";

// Renombrar los archivos y las importaciones
renameFilesAndUpdateImports(cjsDirectoryPath, ".cjs");
renameFilesAndUpdateImports(mjsDirectoryPath, ".mjs");
