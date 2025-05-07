import { mdiClose } from "@mdi/js";
import Button from "../Button";
import Icon from "../Icon/Icon";
import { useEffect, useState } from "react";

export default function PocTemplate({
  icon,
  pocDoc,
  currentIndex,
  pocList,
  onPositionChange,
  onRemovePoc,
  children,
}: {
  pocList: any[];
  [key: string | number | symbol]: any;
}) {
  const [tmpPosition, setTmpPosition] = useState(currentIndex);

  useEffect(() => {
    setTmpPosition(currentIndex.toString().replace(/^0+(?!$)/, ""));
  }, [currentIndex]);

  const positionInputId = `poc-position-${currentIndex}-${pocDoc.key}`;

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      onPositionChange(currentIndex)({ target: { value: e.target.value } });
    }
  };

  const handleBlur = () => {
    onPositionChange(currentIndex)({ target: { value: tmpPosition } });
  };

  return (
    <div className="relative flex flex-col">
      <Icon className="absolute left-[-35px]" path={icon} size={25} />
      <button
        className="absolute right-[-21px] top-[-20px] h-[25px] cursor-pointer rounded text-red-600 hover:opacity-50"
        onClick={onRemovePoc(currentIndex)}
      >
        <Icon path={mdiClose} size={25} />
      </button>
      <div className="flex flex-col gap-3">
        <div className="flex gap-6">
          <div className="col-span-1 col-start-12 grid">
            <label htmlFor={positionInputId}>Position</label>
            <input
              className="w-20 rounded dark:bg-slate-800"
              id={positionInputId}
              type="number"
              value={tmpPosition}
              min={0}
              max={pocList.length - 1}
              onChange={e => setTmpPosition(+e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
            />
          </div>

          <div>
            <div>
              <span>&nbsp;</span>
              <div className="flex h-full gap-2">
                <Button
                  label="Move Up"
                  disabled={currentIndex === 0}
                  onClick={() =>
                    onPositionChange(currentIndex)({ target: { value: currentIndex <= 0 ? 0 : currentIndex - 1 } })
                  }
                />
                <Button
                  label="Move Down"
                  disabled={currentIndex === pocList.length - 1}
                  onClick={() =>
                    onPositionChange(currentIndex)({
                      target: { value: currentIndex >= pocList.length - 1 ? pocList.length - 1 : currentIndex + 1 },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
