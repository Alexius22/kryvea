import { mdiPlus } from "@mdi/js";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxComponentTitle from "../components/CardBox/Component/Title";
import Divider from "../components/Divider";
import SectionMain from "../components/Section/Main";
import { getPageTitle } from "../config";
import PocText from "../components/Poc/PocText";
import PocImage from "../components/Poc/PocImage";
import PocRequestResponse from "../components/Poc/PocRequestResponse";

type PocType = "text" | "image" | "request/response";

export type PocDoc = {
  type: PocType;
  title: string;
  description: string;
  position: number;
};

const EditPoc = () => {
  const [pocList, setPocList] = useState<PocDoc[]>([]);

  useEffect(() => {
    document.title = getPageTitle("Edit PoC");
  }, []);

  useEffect(() => {
    setPocList(prev => prev.sort((a, b) => (a.position < b.position ? -1 : 1)));
  }, [pocList]);

  const addPoc = (type: PocType) => () =>
    setPocList(prev => [...prev, { type, title: "", description: "", position: prev.length }]);

  const onPositionChange = currentIndex => e => {
    setPocList(prev => {
      const newIndex = +e.target.value;

      if (newIndex >= prev.length) {
        return prev;
      }

      const newPocList = [...prev];
      const copyPocDoc = newPocList[newIndex];
      newPocList[newIndex] = {
        ...newPocList[currentIndex],
        position: newIndex,
      };
      newPocList[currentIndex] = {
        ...copyPocDoc,
        position: currentIndex,
      };
      return newPocList;
    });
  };

  const switchPocType = (pocDoc: PocDoc, i: number) => {
    switch (pocDoc.type) {
      case "text":
        return (
          <>
            <PocText {...{ currentIndex: i, pocDoc, pocList, setPocList, onPositionChange, key: `poc-text-${i}` }} />
            <Divider />
          </>
        );
      case "image":
        return (
          <>
            <PocImage {...{ currentIndex: i, pocDoc, pocList, setPocList, onPositionChange, key: `poc-image-${i}` }} />
            <Divider />
          </>
        );
      case "request/response":
        return (
          <>
            <PocRequestResponse
              {...{ currentIndex: i, pocDoc, pocList, setPocList, onPositionChange, key: `poc-request-response-${i}` }}
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
