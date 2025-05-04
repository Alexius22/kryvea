import { mdiImage } from "@mdi/js";
import React, { useEffect, useRef, useState } from "react";
import Icon from "../Icon/Icon";
import { PocDoc, PocImageDoc } from "./Poc.types";

export type PocImageProps = {
  pocDoc: PocImageDoc;
  currentIndex;
  pocList: PocDoc[];
  onPositionChange: (currentIndex: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextChange: <T>(currentIndex, key: keyof Omit<T, "key">) => (e: React.ChangeEvent) => void;
  onImageChange: (currentIndex, image: File) => void;
};

export default function PocImage({
  pocDoc,
  currentIndex,
  pocList,
  onPositionChange,
  onTextChange,
  onImageChange,
}: PocImageProps) {
  const [imageUrl, setImageUrl] = useState<string>();
  const imageInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (!imageUrl) {
        return;
      }

      URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const onImageChangeWrapper = ({ target: { files } }) => {
    if (!files || !files[0]) {
      return;
    }

    const image: File = files[0];

    setImageUrl(URL.createObjectURL(image));
    onImageChange(currentIndex, image);
  };

  const clearImage = () => {
    imageInput.current.value = "";
    setImageUrl(null);
    onImageChange(currentIndex, null);
  };

  const positionInputId = `poc-position-${currentIndex}-${pocDoc.key}`;
  const descriptionTextareaId = `poc-description-${currentIndex}-${pocDoc.key}`;
  const imageInputId = `poc-image-${currentIndex}-${pocDoc.key}`;
  const captionTextareaId = `poc-caption-${currentIndex}-${pocDoc.key}`;

  return (
    <div className="relative flex flex-col">
      <Icon className="absolute left-[-35px] top-[-35px]" path={mdiImage} size={100} />

      <div className="flex flex-col gap-3">
        <div className="col-span-1 grid">
          <label htmlFor={positionInputId}>Position</label>
          <input
            className="w-20 rounded dark:bg-slate-800"
            id={positionInputId}
            type="number"
            value={pocDoc.position}
            min={0}
            max={pocList.length - 1}
            onChange={onPositionChange(currentIndex)}
          />
        </div>

        <div className="col-span-8 grid">
          <label htmlFor={descriptionTextareaId}>Description</label>
          <textarea
            className="rounded dark:bg-slate-800"
            value={pocDoc.description}
            id={descriptionTextareaId}
            onChange={onTextChange<PocImageDoc>(currentIndex, "description")}
          />
        </div>

        <div className="col-span-4 grid gap-4">
          <label htmlFor={imageInputId}>Choose Image</label>
          <div className="flex gap-4">
            <input
              ref={imageInput}
              className="max-w-96 rounded dark:bg-slate-800"
              type="file"
              name="myImage"
              accept="image/png, image/jpeg"
              id={imageInputId}
              onChange={onImageChangeWrapper}
            />
            <button
              className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
              onClick={clearImage}
              type="button"
            >
              Clear Image
            </button>
          </div>

          {imageUrl && (
            <div className="flex w-fit flex-col gap-2 rounded-2xl bg-slate-100/75 p-3 dark:bg-slate-800/75">
              <img
                src={imageUrl}
                alt="Selected image preview"
                className="max-h-[400px] w-full rounded-2xl object-contain"
              />
            </div>
          )}
        </div>

        <div className="col-span-8 grid">
          <label htmlFor={captionTextareaId}>Caption</label>
          <textarea
            className="rounded dark:bg-slate-800"
            value={pocDoc.caption}
            id={captionTextareaId}
            onChange={onTextChange<PocImageDoc>(currentIndex, "caption")}
          />
        </div>
      </div>
    </div>
  );
}
