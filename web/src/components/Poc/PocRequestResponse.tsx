import { mdiCableData } from "@mdi/js";
import React from "react";
import Input from "../Form/Input";
import Textarea from "../Form/Textarea";
import MonacoCodeEditor from "./MonacoCodeEditor";
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
      <Textarea
        label="Description"
        value={pocDoc.description}
        id={descriptionTextareaId}
        onChange={onTextChange<PocRequestResponseDoc>(currentIndex, "description")}
      />

      <Input
        type="text"
        label="URL"
        id={urlInputId}
        value={pocDoc.uri}
        onChange={onTextChange<PocRequestResponseDoc>(currentIndex, "uri")}
      />

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
        <MonacoCodeEditor
          language="http"
          label="Request"
          defaultValue={pocDoc.request}
          onChange={value => onTextChange<PocRequestResponseDoc>(currentIndex, "request")({ target: { value } } as any)}
        />

        <MonacoCodeEditor
          language="http"
          label="Response"
          defaultValue={pocDoc.response}
          onChange={value =>
            onTextChange<PocRequestResponseDoc>(currentIndex, "response")({ target: { value } } as any)
          }
        />
      </div>
    </PocTemplate>
  );
}
