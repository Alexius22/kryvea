import { POC_TYPE_IMAGE, POC_TYPE_REQUEST_RESPONSE, POC_TYPE_TEXT } from "./Poc.consts";

export type PocType = typeof POC_TYPE_TEXT | typeof POC_TYPE_IMAGE | typeof POC_TYPE_REQUEST_RESPONSE;

type PocBaseDoc = {
  key: string;
  description: string;
  index: number;
};

export interface PocTextDoc extends PocBaseDoc {
  type: typeof POC_TYPE_TEXT;
  text_language: string;
  text_data: string;
}

export interface PocImageDoc extends PocBaseDoc {
  type: typeof POC_TYPE_IMAGE;
  image_data: string;
  image_caption: string;
}

export interface PocRequestResponseDoc extends PocBaseDoc {
  type: typeof POC_TYPE_REQUEST_RESPONSE;
  uri: string;
  request: string;
  response: string;
}

export type PocDoc = PocTextDoc | PocImageDoc | PocRequestResponseDoc;
