export type PocType = "text" | "image" | "request/response";

type PocBaseDoc = {
  position: number;
  description: string;
};

export interface PocTextDoc extends PocBaseDoc {
  type: "text";
  language: string;
  text: string;
};

export interface PocImageDoc extends PocBaseDoc {
  type: "image";
  chooseFile: string;
  caption: string;
};

export interface PocRequestResponseDoc extends PocBaseDoc {
  type: "request/response";
  url: string;
  request: string;
  response: string;
};

export type PocDoc = PocTextDoc | PocImageDoc | PocRequestResponseDoc;
