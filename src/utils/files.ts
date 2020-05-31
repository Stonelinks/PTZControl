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
  contents: string | Buffer,
): Promise<boolean> => {
  return new Promise(async resolve => {
    const c = typeof contents === "string" ? contents.trim() + "\n" : contents;
    fs.writeFile(path, c, () => {
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

export const listDirectory = async (path: string): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    fs.readdir(path, (err, items) => {
      if (err) {
        reject(err);
      } else {
        resolve(items);
      }
    });
  });
};

export const stat = async (path: string): Promise<fs.Stats> => {
  return new Promise(async (resolve, reject) => {
    fs.stat(path, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

export const getChronologicalFileList = async (
  path: string,
): Promise<string[]> => {
  const files = await listDirectory(`${path}`);

  const stats = [];

  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const s = await stat(`${path}/${file}`);
    if (s.isFile()) {
      stats.push({
        name: file,
        ...s,
      });
    }
  }

  // sort in chronological order
  stats.sort((a, b) => {
    return a.birthtimeMs > b.birthtimeMs
      ? 1
      : b.birthtimeMs > a.birthtimeMs
      ? -1
      : 0;
  });

  return stats.map(s => s.name);
};
