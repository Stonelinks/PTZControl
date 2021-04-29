import * as fs from "fs";
import * as sizeOf from "image-size";
import * as path from "path";
import * as sharp from "sharp";
import * as shell from "shelljs";
import {
  CACHE_FOLDER,
  CAPTURE_FOLDER,
  THUMBS_FOLDER_NAME,
} from "../common/constants";
import { encode } from "../common/encode";
import { makeCachedFn } from "./cache";

sizeOf.setConcurrency(123456);

export const getSize = (
  fullPath: string,
): { width: number; height: number } => {
  const { width, height } = (sizeOf as any)(fullPath);
  return { width: parseInt(width, 10), height: parseInt(height, 10) };
};

export const getThumbnail = async (imageFilePath: string) => {
  const fullImagePath = path.join(CAPTURE_FOLDER, imageFilePath);

  const thumbsFolder = path.join(
    path.dirname(fullImagePath),
    THUMBS_FOLDER_NAME,
  );

  const thumbImagePath = path.join(
    thumbsFolder,
    `${encode(imageFilePath)}.png`,
  );

  if (fs.existsSync(thumbImagePath)) {
    return thumbImagePath;
  }

  if (!fs.existsSync(thumbsFolder)) {
    shell.mkdir("-p", thumbsFolder);
  }

  await downSize(fullImagePath, thumbImagePath, 1 / 3);

  return thumbImagePath;
};

export const downSize = async (
  inputImageFilePath: string,
  outputImageFilePath: string,
  percentDownsize: number = 0.5, // between 0 and 1
) => {
  const { width, height } = getSize(inputImageFilePath);

  await sharp(inputImageFilePath)
    .resize(
      parseInt((width * percentDownsize).toString(), 10),
      parseInt((height * percentDownsize).toString(), 10),
    )
    .toFile(outputImageFilePath);

  return outputImageFilePath;
};

export const cachedDownsize = makeCachedFn(
  "cachedDownsize",
  async (inputFile, percentDownsize: number = 0.5) => {
    const downsizeCacheBaseDir = `${CACHE_FOLDER}/downsizes`;
    if (!fs.existsSync(downsizeCacheBaseDir)) {
      shell.mkdir("-p", downsizeCacheBaseDir);
    }

    const outputFile = `${downsizeCacheBaseDir}/${encode(inputFile)}-${encode(
      percentDownsize.toString(),
    )}.png`;

    await downSize(inputFile, outputFile, percentDownsize);

    return outputFile;
  },
);

export const fileIsImage = (f: string) =>
  f.toLowerCase().endsWith("jpg") ||
  f.toLowerCase().endsWith("jpeg") ||
  f.toLowerCase().endsWith("png");

export const fileIsGifOrMovie = (f: string) =>
  f.toLowerCase().endsWith("gif") || f.toLowerCase().endsWith("mp4");
