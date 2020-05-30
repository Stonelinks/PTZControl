import * as fs from "fs";
import * as sizeOf from "image-size";
import * as path from "path";
import * as sharp from "sharp";
import * as shell from "shelljs";
import { CAPTURE_FOLDER, THUMBS_FOLDER_NAME } from "../common/constants";
import { encode } from "../common/encode";

sizeOf.setConcurrency(123456);

export const getThumbnail = async (imageFilePath: string) => {
  const fullImagePath = path.join(CAPTURE_FOLDER, imageFilePath);
  const thumbsFolder = path.join(
    path.dirname(fullImagePath),
    THUMBS_FOLDER_NAME,
  );
  const thumbImagePath = path.join(
    thumbsFolder,
    `${encode(imageFilePath)}.jpg`,
  );

  if (fs.existsSync(thumbImagePath)) {
    return thumbImagePath;
  }

  if (!fs.existsSync(thumbsFolder)) {
    shell.mkdir("-p", thumbsFolder);
  }
  const { width, height } = (sizeOf as any)(fullImagePath);

  await sharp(fullImagePath)
    .resize(width / 3, height / 3)
    .toFile(thumbImagePath);

  return thumbImagePath;
};
