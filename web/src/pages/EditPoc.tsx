import { mdiPlus } from "@mdi/js";
import { useEffect } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxComponentTitle from "../components/CardBox/Component/Title";
import Divider from "../components/Divider";
import SectionMain from "../components/Section/Main";
import { getPageTitle } from "../config";

const EditPoc = () => {
  useEffect(() => {
    document.title = getPageTitle("Edit PoC");
  }, []);

  return (
    <>
      <SectionMain>
        <CardBox>
          <CardBoxComponentTitle title="Edit PoC"></CardBoxComponentTitle>
          <Buttons>
            <Button label="Request/Response" color="contrast" icon={mdiPlus} onClick={() => undefined} small />
            <Button label="Image" color="contrast" icon={mdiPlus} onClick={() => undefined} small />
            <Button label="Text" color="contrast" icon={mdiPlus} onClick={() => undefined} small />
          </Buttons>
          <Divider />
          <Buttons>
            <Button label="Submit" color="info" />
          </Buttons>
        </CardBox>
      </SectionMain>
    </>
  );
};

export default EditPoc;
