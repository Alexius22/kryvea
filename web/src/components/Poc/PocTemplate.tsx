import { mdiDelete } from "@mdi/js";
import { useEffect, useState } from "react";
import Button from "../Button";
import Divider from "../Divider";
import Icon from "../Icon";

export default function PocTemplate({
  icon,
  title,
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
    <div className="rounded-3xl">
      <div className="relative flex flex-col p-6">
        <div className="mb-4 flex items-center gap-4">
          <h1 className="flex items-center gap-2 rounded px-2 text-xl uppercase">
            <Icon path={icon} size={25} />
            {title}
          </h1>
          <Button small icon={mdiDelete} onClick={onRemovePoc(currentIndex)} />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-6">
            <div className="col-span-1 col-start-12 grid">
              <label htmlFor={positionInputId}>Position</label>
              <input
                className="no-spinner input w-[55px] rounded text-center"
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
                    small
                    disabled={currentIndex === 0}
                    onClick={() =>
                      onPositionChange(currentIndex)({ target: { value: currentIndex <= 0 ? 0 : currentIndex - 1 } })
                    }
                  />
                  <Button
                    label="Move Down"
                    small
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
    </div>
  );
}
