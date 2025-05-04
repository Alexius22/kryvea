import { mdiCableData } from "@mdi/js";
import React from "react";
import Icon from "../Icon/Icon";
import { PocDoc, PocRequestResponseDoc } from "./Poc.types";

type PocRequestResponseProps = {
  pocDoc: PocRequestResponseDoc;
  currentIndex;
  pocList: PocDoc[];
  onPositionChange: (currentIndex: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextChange: <T>(currentIndex, key: keyof Omit<T, "key">) => (e: React.ChangeEvent) => void;
};

export default function PocRequestResponse({
  pocDoc,
  currentIndex,
  pocList,
  onPositionChange,
  onTextChange,
}: PocRequestResponseProps) {
  const positionInputId = `poc-position-${currentIndex}-${pocDoc.key}`;
  const descriptionTextareaId = `poc-description-${currentIndex}-${pocDoc.key}`;
  const urlInputId = `poc-url-${currentIndex}-${pocDoc.key}`;
  const requestTextareaId = `poc-request-${currentIndex}-${pocDoc.key}`;
  const responseTextareaId = `poc-response-${currentIndex}-${pocDoc.key}`;

  return (
    <div className="relative flex flex-col">
      <Icon className="absolute left-[-35px] top-[-35px]" path={mdiCableData} size={100} />
      <div className="flex flex-col gap-3">
        <div className="col-span-1 grid">
          <label htmlFor={positionInputId}>Position</label>
          <input
            className="w-20 rounded dark:bg-slate-800"
            id={positionInputId}
            type="number"
            value={pocDoc.position}
            min={0}
            max={pocList.length - 1}
            onChange={onPositionChange(currentIndex)}
          />
        </div>

        <div className="col-span-8 grid">
          <label htmlFor={descriptionTextareaId}>Description</label>
          <textarea
            className="rounded dark:bg-slate-800"
            value={pocDoc.description}
            id={descriptionTextareaId}
            onChange={onTextChange<PocRequestResponseDoc>(currentIndex, "description")}
          />
        </div>

        <div className="col-span-4 grid">
          <label htmlFor={urlInputId}>Url</label>
          <input
            id={urlInputId}
            className="max-w-96 rounded dark:bg-slate-800"
            value={pocDoc.url}
            onChange={onTextChange<PocRequestResponseDoc>(currentIndex, "url")}
          />
        </div>

        <div className="col-span-8 grid">
          <label htmlFor={requestTextareaId}>Request</label>
          <textarea
            className="rounded dark:bg-slate-800"
            value={pocDoc.request}
            id={requestTextareaId}
            onChange={onTextChange<PocRequestResponseDoc>(currentIndex, "request")}
          />
        </div>

        <div className="col-span-8 grid">
          <label htmlFor={responseTextareaId}>Response</label>
          <textarea
            className="rounded dark:bg-slate-800"
            value={pocDoc.response}
            id={responseTextareaId}
            onChange={onTextChange<PocRequestResponseDoc>(currentIndex, "response")}
          />
        </div>
      </div>
    </div>
  );
}
