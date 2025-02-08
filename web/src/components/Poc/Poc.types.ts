export type PocType = "text" | "image" | "request/response";

type PocBaseDoc = {
  position: number;
  description: string;
};

export interface PocTextDoc extends PocBaseDoc {
  type: "text";
  title: string;
  language: string;
};

export interface PocImageDoc extends PocBaseDoc {
  type: "image";
  title: string;
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
