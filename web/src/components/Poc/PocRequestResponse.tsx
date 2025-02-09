import { mdiCableData } from "@mdi/js";
import React from "react";
import Icon from "../Icon/Icon";
import { PocDoc, PocRequestResponseDoc } from "./Poc.types";

type PocRequestResponseProps = {
  pocDoc: PocRequestResponseDoc;
  currentIndex;
  pocList: PocDoc[];
  onPositionChange: (currentIndex: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPocTextChange: <T>(currentIndex, key: keyof T) => (e: React.ChangeEvent) => void;
};

export default function PocRequestResponse({
  pocDoc,
  currentIndex,
  pocList,
  onPositionChange,
  onPocTextChange,
}: PocRequestResponseProps) {
  return (
    <div className="relative flex flex-col">
      <Icon className="absolute left-[-35px] top-[-35px]" path={mdiCableData} size={100} />
      <div className="flex flex-col gap-3">
        <div className="col-span-1 grid">
          <label htmlFor={`poc-position-${currentIndex}`}>Position</label>
          <input
            className="w-20 rounded dark:bg-slate-800"
            id={`poc-position-${currentIndex}`}
            type="number"
            value={pocDoc.position}
            min={0}
            max={pocList.length - 1}
            onChange={onPositionChange(currentIndex)}
          />
        </div>
        <div className="col-span-8 grid">
          <label htmlFor={`poc-description-${currentIndex}`}>Description</label>
          <textarea
            className="rounded dark:bg-slate-800"
            value={pocDoc.description}
            id={`poc-description-${currentIndex}`}
            onChange={onPocTextChange<PocRequestResponseDoc>(currentIndex, "description")}
          />
        </div>
        <div className="col-span-4 grid">
          <label htmlFor={`poc-title-${currentIndex}`}>Url</label>
          <input
            id={`poc-title-${currentIndex}`}
            className="max-w-96 rounded dark:bg-slate-800"
            value={pocDoc.url}
            onChange={onPocTextChange<PocRequestResponseDoc>(currentIndex, "url")}
          />
        </div>
        <div className="col-span-8 grid">
          <label htmlFor={`poc-description-${currentIndex}`}>Request</label>
          <textarea
            className="rounded dark:bg-slate-800"
            value={pocDoc.request}
            id={`poc-description-${currentIndex}`}
            onChange={onPocTextChange<PocRequestResponseDoc>(currentIndex, "request")}
          />
        </div>
        <div className="col-span-8 grid">
          <label htmlFor={`poc-description-${currentIndex}`}>Response</label>
          <textarea
            className="rounded dark:bg-slate-800"
            value={pocDoc.response}
            id={`poc-description-${currentIndex}`}
            onChange={onPocTextChange<PocRequestResponseDoc>(currentIndex, "response")}
          />
        </div>
      </div>
    </div>
  );
}
