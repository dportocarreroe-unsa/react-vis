import { promises as fs } from "fs";
import path from "path";

export const getFileContent = async (filePath: string) => {
	const fileContent = await fs.readFile(filePath, { encoding: "utf-8" });
	return fileContent;
};

export const saveJSONToFile = async (filePath: string, content: any) => {
	await fs.writeFile(filePath, JSON.stringify(content));
};

const checkDirectory = async (
	files: string[],
	directoryPath: string,
	extensions?: string[]
) => {
	const dir = await fs.readdir(directoryPath);
	for (const file of dir) {
		const absolutePath = path.join(directoryPath, file);
		if ((await fs.stat(absolutePath)).isDirectory()) {
			await checkDirectory(files, absolutePath, extensions);
		} else {
			const fileExtension = file.split(".")[1];
			if (extensions) {
				if (extensions.includes(fileExtension)) {
					files.push(absolutePath);
				}
			} else {
				files.push(absolutePath);
			}
		}
	}
};

export const getFilesFromDirectory = async (
	directoryPath: string,
	extensions?: string[]
) => {
	const files: string[] = [];
	await checkDirectory(files, directoryPath, extensions);
	return files;
};
