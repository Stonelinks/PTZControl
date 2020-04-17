import * as fs from "fs";
import { JsonSerializable } from "../common/json";

export const readFileAsync = async (path: string): Promise<string> => {
  return new Promise(async resolve => {
    fs.readFile(path, "utf8", (err, contents) => {
      resolve(contents);
    });
  });
};

export const writeFileAsync = async (
  path: string,
  contents: string,
): Promise<boolean> => {
  return new Promise(async resolve => {
    fs.writeFile(path, contents.trim() + "\n", () => {
      resolve(true);
    });
  });
};

export const readJsonAsync = async (path: string) => {
  const contents = await readFileAsync(path);
  return JSON.parse(contents);
};

export const writeJsonAsync = async (
  path: string,
  contents: JsonSerializable,
) => {
  await writeFileAsync(path, JSON.stringify(contents, null, 2));
};
