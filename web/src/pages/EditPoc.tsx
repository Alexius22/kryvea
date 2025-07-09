import { mdiPlus, mdiSend } from "@mdi/js";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { getData, postData } from "../api/api";
import Card from "../components/CardBox/Card";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import { POC_TYPE_IMAGE, POC_TYPE_REQUEST_RESPONSE, POC_TYPE_TEXT } from "../components/Poc/Poc.consts";
import { PocDoc, PocImageDoc, PocType } from "../components/Poc/Poc.types";
import PocImage, { PocImageProps } from "../components/Poc/PocImage";
import PocRequestResponse from "../components/Poc/PocRequestResponse";
import PocText from "../components/Poc/PocText";
import { getPageTitle } from "../config";

export default function EditPoc() {
  const [pocList, setPocList] = useState<PocDoc[]>([]);
  const [onPositionChangeMode, setOnPositionChangeMode] = useState<"swap" | "shift">("shift");
  const [selectedPoc, setSelectedPoc] = useState<number>(0);

  const pocListParent = useRef<HTMLDivElement>(null);

  const { vulnerabilityId } = useParams();

  const getPocKeyByType = (type: PocType) => `poc-${type}-${v4()}`;

  useEffect(() => {
    document.title = getPageTitle("Edit PoC");
  }, []);
  useEffect(() => {
    getData<PocDoc[]>(`/api/vulnerabilities/${vulnerabilityId}/pocs`, pocs =>
      setPocList(pocs.sort((a, b) => a.index - b.index).map((poc, i) => ({ ...poc, key: getPocKeyByType(poc.type) })))
    );
  }, []);
  useEffect(() => {
    const handleDragStart = () => {
      pocListParent.current?.classList.add("dragging");
    };
    const handleDragEnd = () => {
      pocListParent.current?.classList.remove("dragging");
    };
    document.addEventListener("dragover", handleDragStart);
    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("visibilitychange", handleDragEnd);
    return () => {
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("visibilitychange", handleDragEnd);
    };
  }, []);

  function onTextChange<T>(currentIndex, property: keyof Omit<T, "key">) {
    return e => {
      setPocList(prev => {
        const newText = e.target.value;
        const newPocList = [...prev];
        newPocList[currentIndex] = { ...newPocList[currentIndex], [property]: newText };
        return newPocList;
      });
    };
  }
  async function onImageChange(currentIndex, file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const image_data = btoa(Array.from(new Uint8Array(arrayBuffer)).toString());

    setPocList(prev => {
      const newPocList = [...prev];
      newPocList[currentIndex] = { ...newPocList[currentIndex], image_data } as PocImageDoc;
      return newPocList;
    });
  }

  const onPositionChange = currentIndex => e => {
    const num = e;
    const newIndex = +num;
    const shift = (prev: PocDoc[]) => {
      if (newIndex < 0 || newIndex >= prev.length) {
        return prev;
      }

      const arr = [...prev];
      const copyCurrent = { ...arr[currentIndex] };

      if (newIndex < currentIndex) {
        for (let i = currentIndex; i > newIndex; i--) {
          arr[i] = { ...arr[i - 1] };
        }
        arr[newIndex] = { ...copyCurrent };
        return arr;
      }

      for (let i = currentIndex; i < newIndex; i++) {
        arr[i] = { ...arr[i + 1] };
      }
      arr[newIndex] = { ...copyCurrent };

      return arr;
    };
    const swap = (prev: PocDoc[]) => {
      if (newIndex < 0 || newIndex >= prev.length) {
        return prev;
      }

      const arr = [...prev];
      const copyCurrent = { ...arr[currentIndex] };
      arr[currentIndex] = { ...arr[newIndex] };
      arr[newIndex] = { ...copyCurrent };
      return arr;
    };
    setPocList(onPositionChangeMode === "shift" ? shift : swap);
  };
  const onRemovePoc = (currentIndex: number) => () => {
    setPocList(prev => {
      const newPocList = [...prev];
      newPocList.splice(currentIndex, 1);
      return newPocList;
    });
  };

  const addPoc = (type: PocType) => () => {
    const key = getPocKeyByType(type);
    switch (type) {
      case POC_TYPE_TEXT:
        setPocList(prev => [
          ...prev,
          {
            key,
            type,
            index: prev.length,
            description: "",
            text_language: "",
            text_data: "",
          },
        ]);
        break;
      case POC_TYPE_IMAGE:
        setPocList(prev => [
          ...prev,
          {
            key,
            type,
            index: prev.length,
            description: "",
            image_caption: "",
            image_data: null,
            title: "",
          },
        ]);
        break;
      case POC_TYPE_REQUEST_RESPONSE:
        setPocList(prev => [
          ...prev,
          {
            key,
            type,
            index: prev.length,
            description: "",
            request: "",
            response: "",
            uri: "",
          },
        ]);
        break;
    }
  };

  const switchPocType = (pocDoc: PocDoc, i: number) => {
    switch (pocDoc.type) {
      case POC_TYPE_TEXT:
        return (
          <PocText
            {...{
              currentIndex: i,
              pocDoc,
              pocList,
              onPositionChange,
              onTextChange,
              onRemovePoc,
              selectedPoc,
              setSelectedPoc,
            }}
            key={pocDoc.key}
          />
        );
      case POC_TYPE_IMAGE:
        const pocImageProps: PocImageProps = {
          currentIndex: i,
          pocDoc,
          pocList,
          onPositionChange,
          onTextChange,
          onRemovePoc,
          onImageChange,
          selectedPoc,
          setSelectedPoc,
        };
        return <PocImage {...pocImageProps} key={pocDoc.key} />;
      case POC_TYPE_REQUEST_RESPONSE:
        return (
          <PocRequestResponse
            {...{
              currentIndex: i,
              pocDoc,
              pocList,
              onPositionChange,
              onTextChange,
              onRemovePoc,
              selectedPoc,
              setSelectedPoc,
            }}
            key={pocDoc.key}
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="glasscard edit-poc-header sticky top-0 z-10 rounded-b-3xl">
        <Card className="!border-2 !border-[color:--bg-active] !bg-neutral-50/0">
          <h1 className="mb-3 text-2xl">Edit PoC</h1>
          <Buttons>
            <Button text="Request/Response" icon={mdiPlus} onClick={addPoc(POC_TYPE_REQUEST_RESPONSE)} small />
            <Button text="Image" icon={mdiPlus} onClick={addPoc(POC_TYPE_IMAGE)} small />
            <Button text="Text" icon={mdiPlus} onClick={addPoc(POC_TYPE_TEXT)} small />
            <Button
              className="ml-auto"
              text="Submit"
              icon={mdiSend}
              onClick={() => {
                postData(
                  `/api/pocs`,
                  pocList.map((poc, index) => ({ ...poc, index, key: undefined })),
                  () => {
                    toast.success("PoCs updated successfully");
                  }
                );
              }}
            />
          </Buttons>
        </Card>
      </div>
      <div ref={pocListParent} className="relative flex w-full flex-col gap-3">
        {pocList.map(switchPocType)}
      </div>
    </div>
  );
}
