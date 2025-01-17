import { mdiPlus } from "@mdi/js";
import { useEffect } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import SectionMain from "../components/Section/Main";
import { getPageTitle } from "../config";

const EditPoc = () => {
  useEffect(() => {
    document.title = getPageTitle("Add PoC");
  }, []);

  return (
    <>
      <SectionMain>
        <CardBox className="mb-6 flex" hasTable>
          <table className="table-fixed">
            <thead>
              <tr>
                <th>Edit PoC</th>
              </tr>
            </thead>
            <tr>
              <td className="whitespace-nowrap before:hidden lg:w-1">
                <Buttons type="text-center" noWrap>
                  <Button label="Request/Response" color="contrast" icon={mdiPlus} onClick={() => undefined} small />
                  <Button label="Image" color="contrast" icon={mdiPlus} onClick={() => undefined} small />
                  <Button label="Text" color="contrast" icon={mdiPlus} onClick={() => undefined} small />
                </Buttons>
              </td>
            </tr>
          </table>
        </CardBox>
      </SectionMain>
    </>
  );
};

export default EditPoc;
