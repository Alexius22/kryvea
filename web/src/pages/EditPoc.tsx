import { mdiPlus } from "@mdi/js";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxComponentTitle from "../components/CardBox/Component/Title";
import Divider from "../components/Divider";
import { PocDoc, PocType } from "../components/Poc/Poc.types";
import PocImage from "../components/Poc/PocImage";
import PocRequestResponse from "../components/Poc/PocRequestResponse";
import PocText from "../components/Poc/PocText";
import SectionMain from "../components/Section/Main";
import { getPageTitle } from "../config";

const EditPoc = () => {
  const [pocList, setPocList] = useState<PocDoc[]>([]);
  const [onPositionChangeMode, setOnPositionChangeMode] = useState<"swap" | "shift">("shift");

  useEffect(() => {
    document.title = getPageTitle("Edit PoC");
  }, []);

  useEffect(() => {
    setPocList(prev => prev.sort((a, b) => (a.position < b.position ? -1 : 1)));
  }, [pocList]);

  function onPocTextChange<T>(currentIndex, key: keyof T) {
    return e => {
      setPocList(prev => {
        const newText = e.target.value;
        const newPocList = [...prev];
        newPocList[currentIndex] = { ...newPocList[currentIndex], [key]: newText };
        return newPocList;
      });
    };
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
    switch (type) {
      case "text":
        setPocList(prev => [
          ...prev,
          {
            type,
            position: prev.length,
            description: undefined,
            language: undefined,
            text: undefined,
          },
        ]);
        break;
      case "image":
        setPocList(prev => [
          ...prev,
          {
            type,
            position: prev.length,
            description: undefined,
            caption: undefined,
            chooseFile: undefined,
            title: undefined,
          },
        ]);
        break;
      case "request/response":
        setPocList(prev => [
          ...prev,
          {
            type,
            position: prev.length,
            description: undefined,
            request: undefined,
            response: undefined,
            url: undefined,
          },
        ]);
        break;
    }
  };

  const switchPocType = (pocDoc: PocDoc, i: number) => {
    switch (pocDoc.type) {
      case "text":
        return (
          <>
            <PocText
              {...{
                currentIndex: i,
                pocDoc,
                pocList,
                setPocList,
                onPositionChange,
                onPocTextChange,
                key: `poc-text-${i}`,
              }}
            />
            <Divider />
          </>
        );
      case "image":
        return (
          <>
            <PocImage
              {...{
                currentIndex: i,
                pocDoc,
                pocList,
                setPocList,
                onPositionChange,
                onPocTextChange,
                key: `poc-image-${i}`,
              }}
            />
            <Divider />
          </>
        );
      case "request/response":
        return (
          <>
            <PocRequestResponse
              {...{
                currentIndex: i,
                pocDoc,
                pocList,
                setPocList,
                onPositionChange,
                onPocTextChange,
                key: `poc-request-response-${i}`,
              }}
            />
            <Divider />
          </>
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
