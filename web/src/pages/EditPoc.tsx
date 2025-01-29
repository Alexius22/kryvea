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

  const addPoc = (type: PocType) => () =>
    setPocList(prev => [...prev, { type, title: "", description: "", position: prev.length }]);

  const switchPocType = (pocDoc: PocDoc, i: number) => {
    switch (pocDoc.type) {
      case "text":
        return (
          <>
            <PocText {...{ i, pocDoc, pocList, setPocList, key: `poc-text-${i}` }} />
            <Divider />
          </>
        );
      case "image":
        return (
          <>
            <Divider />
          </>
        );
      case "request/response":
        return (
          <>
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
          <div className="flex flex-col">
            {pocList.sort((a, b) => (a.position < b.position ? -1 : 1)).map(switchPocType)}
          </div>
          <Buttons>
            <Button label="Submit" color="info" />
          </Buttons>
        </CardBox>
      </SectionMain>
    </>
  );
};

export default EditPoc;
