import OpengraphImage, {
  size as ogSize,
  contentType as ogContentType,
  alt as ogAlt,
} from "./opengraph-image";

export const runtime = "nodejs";
export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export default OpengraphImage;
