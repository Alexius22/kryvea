import React from "react";
import { PocDoc } from "../../pages/EditPoc";

type PocProps = {
  pocDoc: PocDoc;
  i;
  pocList: PocDoc[];
  setPocList: React.Dispatch<React.SetStateAction<PocDoc[]>>;
};

export default function PocText({ pocDoc, i, pocList, setPocList }: PocProps) {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-4 grid">
          <label htmlFor={`poc-title-${i}`}>Title</label>
          <input
            id={`poc-title-${i}`}
            className="rounded dark:bg-slate-800"
            value={pocDoc.title}
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
            value={pocDoc.position}
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
  );
}
