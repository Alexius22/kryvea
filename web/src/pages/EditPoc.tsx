import { mdiPlus } from "@mdi/js";
import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxComponentTitle from "../components/CardBox/Component/Title";
import Divider from "../components/Divider";
import { PocDoc, PocImageDoc, PocType } from "../components/Poc/Poc.types";
import PocImage, { PocImageProps } from "../components/Poc/PocImage";
import PocRequestResponse from "../components/Poc/PocRequestResponse";
import PocText from "../components/Poc/PocText";
import SectionMain from "../components/Section/Main";
import { getPageTitle } from "../config";
import { v4 } from "uuid";

const EditPoc = () => {
  const [pocList, setPocList] = useState<PocDoc[]>([]);
  const [onPositionChangeMode, setOnPositionChangeMode] = useState<"swap" | "shift">("shift");

  useEffect(() => {
    document.title = getPageTitle("Edit PoC");
  }, []);

  useEffect(() => {
    setPocList(prev => prev.sort((a, b) => (a.position < b.position ? -1 : 1)));
  }, [pocList]);

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
    const shift = (prev: PocDoc[]) => {
      const newIndex = +e.target.value;
      if (newIndex < 0 || newIndex >= prev.length) {
        return prev;
      }

      const arr = [...prev];
      const copyCurrent = { ...arr[currentIndex] };

      if (newIndex < currentIndex) {
        for (let i = currentIndex; i > newIndex; i--) {
          arr[i] = { ...arr[i - 1], position: arr[i - 1].position + 1 };
        }
        arr[newIndex] = { ...copyCurrent, position: newIndex };
        return arr;
      }

      for (let i = currentIndex; i < newIndex; i++) {
        arr[i] = { ...arr[i + 1], position: arr[i + 1].position - 1 };
      }
      arr[newIndex] = { ...copyCurrent, position: newIndex };

      return arr;
    };
    const swap = (prev: PocDoc[]) => {
      const newIndex = +e.target.value;
      if (newIndex < 0 || newIndex >= prev.length) {
        return prev;
      }

      const arr = [...prev];
      const copyCurrent = { ...arr[currentIndex] };
      arr[currentIndex] = { ...arr[newIndex], position: currentIndex };
      arr[newIndex] = { ...copyCurrent, position: newIndex };
      return arr;
    };
    setPocList(onPositionChangeMode === "shift" ? shift : swap);
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
          <React.Fragment key={pocDoc.key}>
            <PocText
              {...{
                currentIndex: i,
                pocDoc,
                pocList,
                setPocList,
                onPositionChange,
                onTextChange,
              }}
            />
            <Divider />
          </React.Fragment>
        );
      case "image":
        const pocImageProps: PocImageProps = {
          currentIndex: i,
          pocDoc,
          pocList,
          onPositionChange,
          onTextChange,
          onImageChange,
        };
        return (
          <React.Fragment key={pocDoc.key}>
            <PocImage {...pocImageProps} />
            <Divider />
          </React.Fragment>
        );
      case "request/response":
        return (
          <React.Fragment key={pocDoc.key}>
            <PocRequestResponse
              {...{
                currentIndex: i,
                pocDoc,
                pocList,
                setPocList,
                onPositionChange,
                onTextChange,
              }}
            />
            <Divider />
          </React.Fragment>
        );
    }
  };

  return (
    <>
      <SectionMain>
        <CardBox>
          <CardBoxComponentTitle title="Edit PoC"></CardBoxComponentTitle>
          <Buttons>
            <Button
              label="Request/Response"
              color="contrast"
              icon={mdiPlus}
              onClick={addPoc("request/response")}
              small
            />
            <Button label="Image" color="contrast" icon={mdiPlus} onClick={addPoc("image")} small />
            <Button label="Text" color="contrast" icon={mdiPlus} onClick={addPoc("text")} small />
          </Buttons>
          <Divider />
          <div className="flex flex-col">{pocList.map(switchPocType)}</div>
          <Buttons>
            <Button label="Submit" color="info" />
          </Buttons>
        </CardBox>
      </SectionMain>
    </>
  );
};

export default EditPoc;
