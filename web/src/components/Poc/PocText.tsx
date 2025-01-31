import React from "react";
import { PocDoc } from "../../pages/EditPoc";

type PocProps = {
  pocDoc: PocDoc;
  currentIndex;
  pocList: PocDoc[];
  setPocList: React.Dispatch<React.SetStateAction<PocDoc[]>>;
  onPositionChange: (currentIndex: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function PocText({ pocDoc, currentIndex, pocList, setPocList, onPositionChange }: PocProps) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3">
        <div className="col-span-4 grid">
          <label htmlFor={`poc-title-${currentIndex}`}>Title</label>
          <input
            id={`poc-title-${currentIndex}`}
            className="max-w-96 rounded dark:bg-slate-800"
            value={pocDoc.title}
            onChange={e =>
              setPocList(prev => {
                const newText = e.target.value;
                const newPocList = [...prev];
                newPocList[currentIndex] = { ...newPocList[currentIndex], title: newText };
                return newPocList;
              })
            }
          />
        </div>
        <div className="col-span-8 grid">
          <label htmlFor={`poc-description-${currentIndex}`}>Description</label>
          <textarea
            className="rounded dark:bg-slate-800"
            value={pocDoc.description}
            id={`poc-description-${currentIndex}`}
            onChange={e => {
              setPocList(prev => {
                const newText = e.target.value;
                const newPocList = [...prev];
                newPocList[currentIndex] = { ...newPocList[currentIndex], description: newText };
                return newPocList;
              });
            }}
          />
        </div>
        <div className="col-span-full col-start-12 grid">
          <label htmlFor={`poc-position-${currentIndex}`}>Position</label>
          <input
            className="w-20 rounded dark:bg-slate-800"
            id={`poc-position-${currentIndex}`}
            type="number"
            value={pocDoc.position}
            min={0}
            max={pocList.length - 1}
            onChange={onPositionChange(currentIndex)}
          />
        </div>
      </div>
    </div>
  );
}
