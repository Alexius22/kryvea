import { mdiPlus, mdiSend } from "@mdi/js";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox/CardBox";
import { PocDoc, PocImageDoc, PocType } from "../components/Poc/Poc.types";
import PocImage, { PocImageProps } from "../components/Poc/PocImage";
import PocRequestResponse from "../components/Poc/PocRequestResponse";
import PocText from "../components/Poc/PocText";
import { getPageTitle } from "../config";

const EditPoc = () => {
  const [pocList, setPocList] = useState<PocDoc[]>([]);
  const [onPositionChangeMode, setOnPositionChangeMode] = useState<"swap" | "shift">("shift");

  useEffect(() => {
    document.title = getPageTitle("Edit PoC");
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
  function onImageChange(currentIndex, image: File) {
    setPocList(prev => {
      const newPocList = [...prev];
      newPocList[currentIndex] = { ...newPocList[currentIndex], choseImage: image } as PocImageDoc;
      return newPocList;
    });
  }

  const onPositionChange = currentIndex => e => {
    const num = e.target.value.toString().replace(/^0+(?!$)/, "");
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
    const key = `poc-${type}-${v4()}`;
    switch (type) {
      case "text":
        setPocList(prev => [
          ...prev,
          {
            key,
            type,
            position: prev.length,
            description: "",
            language: "",
            text: "",
          },
        ]);
        break;
      case "image":
        setPocList(prev => [
          ...prev,
          {
            key,
            type,
            position: prev.length,
            description: "",
            caption: "",
            choseImage: null,
            title: "",
          },
        ]);
        break;
      case "request/response":
        setPocList(prev => [
          ...prev,
          {
            key,
            type,
            position: prev.length,
            description: "",
            request: "",
            response: "",
            url: "",
          },
        ]);
        break;
    }
  };

  const switchPocType = (pocDoc: PocDoc, i: number) => {
    switch (pocDoc.type) {
      case "text":
        return (
          <PocText
            {...{
              currentIndex: i,
              pocDoc,
              pocList,
              onPositionChange,
              onTextChange,
              onRemovePoc,
            }}
            key={pocDoc.key}
          />
        );
      case "image":
        const pocImageProps: PocImageProps = {
          currentIndex: i,
          pocDoc,
          pocList,
          onPositionChange,
          onTextChange,
          onRemovePoc,
          onImageChange,
        };
        return <PocImage {...pocImageProps} key={pocDoc.key} />;
      case "request/response":
        return (
          <PocRequestResponse
            {...{
              currentIndex: i,
              pocDoc,
              pocList,
              onPositionChange,
              onTextChange,
              onRemovePoc,
            }}
            key={pocDoc.key}
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="sticky top-0 z-10">
        <CardBox>
          <h1 className="mb-3 text-2xl">Edit PoC</h1>
          <Buttons>
            <Button label="Request/Response" icon={mdiPlus} onClick={addPoc("request/response")} small />
            <Button label="Image" icon={mdiPlus} onClick={addPoc("image")} small />
            <Button label="Text" icon={mdiPlus} onClick={addPoc("text")} small />
            <Button className="ml-auto" label="Submit" icon={mdiSend} />
          </Buttons>
        </CardBox>
      </div>
      <div className="relative flex w-full flex-col gap-3">{pocList.map(switchPocType)}</div>
    </div>
  );
};

export default EditPoc;
