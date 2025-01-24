import { mdiPlus } from "@mdi/js";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxComponentTitle from "../components/CardBox/Component/Title";
import Divider from "../components/Divider";
import SectionMain from "../components/Section/Main";
import { getPageTitle } from "../config";

type PocDoc = {
  title: string;
  description: string;
  position: number;
};

const EditPoc = () => {
  const [pocList, setPocList] = useState<PocDoc[]>([]);
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
            <Button
              label="Text"
              color="contrast"
              icon={mdiPlus}
              onClick={() => setPocList(prev => [...prev, { title: "", description: "", position: prev.length }])}
              small
            />
          </Buttons>
          <Divider />
          <div className="flex flex-col">
            {pocList
              .sort((a, b) => (a.position < b.position ? -1 : 1))
              .map((el, i) => (
                <>
                  <div className="flex flex-col">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-4 grid">
                        <label htmlFor={`poc-title-${i}`}>Title</label>
                        <input
                          id={`poc-title-${i}`}
                          className="rounded dark:bg-slate-800"
                          value={el.title}
                          onChange={e =>
                            setPocList(prev => {
                              const newText = e.target.value;
                              const newPocList = [...prev];
                              newPocList[i] = { ...newPocList[i], title: newText };
                              return newPocList;
                            })
                          }
                        />
                      </div>
                      <div className="col-span-8 grid">
                        <label htmlFor={`poc-description-${i}`}>Description</label>
                        <textarea id={`poc-description-${i}`} className="rounded dark:bg-slate-800">
                          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quam, recusandae?
                        </textarea>
                      </div>
                      <div className="col-span-full col-start-12 grid">
                        <label htmlFor={`poc-position-${i}`}>Position</label>
                        <input
                          id={`poc-position-${i}`}
                          type="number"
                          value={el.position}
                          min={0}
                          max={pocList.length - 1}
                          onChange={e => {
                            setPocList(prev => {
                              const positionNum = +e.target.value;
                              const newPocList = [...prev];
                              newPocList[i] = { ...newPocList[i], position: Math.min(positionNum, prev.length - 1) };
                              return newPocList;
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <Divider />
                </>
              ))}
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
