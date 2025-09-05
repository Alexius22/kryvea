import { mdiDelete } from "@mdi/js";
import { useRef } from "react";
import Flex from "../Composition/Flex";
import Icon from "../Composition/Icon";
import Button from "../Form/Button";
import Buttons from "../Form/Buttons";
import Input from "../Form/Input";

export default function PocTemplate({
  icon,
  title,
  pocDoc,
  currentIndex,
  pocList,
  onPositionChange,
  onRemovePoc,
  selectedPoc,
  setSelectedPoc,
  handleDrop = () => () => {},
  children,
}: {
  pocList: any[];
  [key: string | number | symbol]: any;
}) {
  const dropRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);

  const positionInputId = `poc-position-${currentIndex}-${pocDoc.key}`;

  return (
    <div
      className="poc-template"
      data-focused={selectedPoc === currentIndex}
      onDragEnter={e => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        dropRef.current?.classList.add("dragged-over");
      }}
      onDragLeave={e => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
          dropRef.current?.classList.remove("dragged-over");
        }
      }}
      onDrop={e => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        dropRef.current?.classList.remove("dragged-over");
        handleDrop(dropRef)(e); // Pass event down
      }}
      onDragOver={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={() => setSelectedPoc(currentIndex)}
      ref={dropRef}
      data-name="poc-template"
    >
      <div className="drop-image-over-hinter">
        <br />
        Drop image here
      </div>
      <Flex className="gap-4" items="center">
        <h1 className="flex items-center gap-2 rounded text-xl uppercase">
          <Icon path={icon} size={25} />
          {title}
        </h1>
        <Button variant="danger" small icon={mdiDelete} onClick={onRemovePoc(currentIndex)} />
      </Flex>
      <Flex col className="gap-2">
        <div className="poc-template-children-sibling flex gap-6">
          <Input
            label="Index"
            type="number"
            className="input h-8 w-[55px] rounded text-center"
            id={positionInputId}
            value={currentIndex + 1}
            min={1}
            max={pocList.length}
            onChange={e => onPositionChange(currentIndex)(e - 1)}
          />

          <Buttons>
            <Button
              text="Move Up"
              small
              className="h-8"
              disabled={currentIndex === 0}
              onClick={() => onPositionChange(currentIndex)(currentIndex <= 0 ? 0 : currentIndex - 1)}
            />
            <Button
              text="Move Down"
              small
              disabled={currentIndex === pocList.length - 1}
              onClick={() =>
                onPositionChange(currentIndex)(
                  currentIndex >= pocList.length - 1 ? pocList.length - 1 : currentIndex + 1
                )
              }
            />
          </Buttons>
        </div>
        {children}
      </Flex>
    </div>
  );
}
