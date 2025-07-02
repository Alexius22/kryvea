export type PocType = "text" | "image" | "request/response";

type PocBaseDoc = {
  key: string;
  description: string;
  index: number;
};

export interface PocTextDoc extends PocBaseDoc {
  type: "text";
  language: string;
  text: string;
}

export interface PocImageDoc extends PocBaseDoc {
  type: "image";
  image_data: string;
  image_caption: string;
}

export interface PocRequestResponseDoc extends PocBaseDoc {
  type: "request/response";
  uri: string;
  request: string;
  response: string;
}

export type PocDoc = PocTextDoc | PocImageDoc | PocRequestResponseDoc;
