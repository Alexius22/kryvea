import { mdiCableData } from "@mdi/js";
import React from "react";
import Textarea from "../Form/Textarea";
import { PocDoc, PocRequestResponseDoc } from "./Poc.types";
import PocTemplate from "./PocTemplate";

type PocRequestResponseProps = {
  pocDoc: PocRequestResponseDoc;
  currentIndex;
  pocList: PocDoc[];
  onPositionChange: (currentIndex: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextChange: <T>(currentIndex, key: keyof Omit<T, "key">) => (e: React.ChangeEvent) => void;
  onRemovePoc: (currentIndex: number) => void;
  selectedPoc: number;
  setSelectedPoc: (index: number) => void;
};

export default function PocRequestResponse({
  pocDoc,
  currentIndex,
  pocList,
  onPositionChange,
  onTextChange,
  onRemovePoc,
  selectedPoc,
  setSelectedPoc,
}: PocRequestResponseProps) {
  const descriptionTextareaId = `poc-description-${currentIndex}-${pocDoc.key}`;
  const urlInputId = `poc-url-${currentIndex}-${pocDoc.key}`;
  const requestTextareaId = `poc-request-${currentIndex}-${pocDoc.key}`;
  const responseTextareaId = `poc-response-${currentIndex}-${pocDoc.key}`;

  return (
    <PocTemplate
      {...{
        pocDoc,
        currentIndex,
        pocList,
        icon: mdiCableData,
        onPositionChange,
        onRemovePoc,
        selectedPoc,
        setSelectedPoc,
        title: "Request/Response",
      }}
    >
      <div className="poc-request-response col-span-8 grid">
        <label htmlFor={descriptionTextareaId}>Description</label>
        <Textarea
          value={pocDoc.description}
          id={descriptionTextareaId}
          onChange={onTextChange<PocRequestResponseDoc>(currentIndex, "description")}
        />
      </div>

      <div className="col-span-4 grid">
        <label htmlFor={urlInputId}>URL</label>
        <input
          id={urlInputId}
          className=""
          value={pocDoc.uri}
          onChange={onTextChange<PocRequestResponseDoc>(currentIndex, "uri")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
        <div className="grid">
          <label htmlFor={requestTextareaId}>Request</label>
          <Textarea
            value={pocDoc.request}
            id={requestTextareaId}
            onChange={onTextChange<PocRequestResponseDoc>(currentIndex, "request")}
          />
        </div>

        <div className="grid">
          <label htmlFor={responseTextareaId}>Response</label>
          <Textarea
            value={pocDoc.response}
            id={responseTextareaId}
            onChange={onTextChange<PocRequestResponseDoc>(currentIndex, "response")}
          />
        </div>
      </div>
    </PocTemplate>
  );
}
