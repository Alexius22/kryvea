import { mdiImage } from "@mdi/js";
import React, { useEffect, useRef, useState } from "react";
import Grid from "../Composition/Grid";
import Textarea from "../Form/Textarea";
import UploadFile from "../Form/UploadFile";
import { PocDoc, PocImageDoc } from "./Poc.types";
import PocTemplate from "./PocTemplate";

export type PocImageProps = {
  pocDoc: PocImageDoc;
  currentIndex;
  pocList: PocDoc[];
  onPositionChange: (currentIndex: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextChange: <T>(currentIndex, key: keyof Omit<T, "key">) => (e: React.ChangeEvent) => void;
  onImageChange: (currentIndex, image: File) => void;
  onRemovePoc: (currentIndex: number) => void;
  selectedPoc: number;
  setSelectedPoc: (index: number) => void;
};

export default function PocImage({
  pocDoc,
  currentIndex,
  pocList,
  onPositionChange,
  onTextChange,
  onImageChange,
  onRemovePoc,
  selectedPoc,
  setSelectedPoc,
}: PocImageProps) {
  const [imageUrl, setImageUrl] = useState<string>();
  const [filename, setFilename] = useState<string>();
  const imageInput = useRef<HTMLInputElement>(null);

  const handleDrop = pocTemplateRef => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    document.dispatchEvent(new MouseEvent("dragend", { bubbles: true }));
    pocTemplateRef.current?.classList.remove("dragged-over");

    // onImageChangeWrapper(e as any);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "image/png" || file.type === "image/jpeg") {
        const reader = new FileReader();
        reader.readAsDataURL(file);
      }

      setFilename(file.name);
      setImageUrl(URL.createObjectURL(file));
      onImageChange(currentIndex, file);
    }
  };

  useEffect(() => {
    if (selectedPoc !== currentIndex) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();

          if (!file || (file.type !== "image/png" && file.type !== "image/jpeg")) {
            continue;
          }

          setFilename(file.name);
          setImageUrl(URL.createObjectURL(file));
          onImageChange(currentIndex, file);
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [selectedPoc, currentIndex]);

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

    setFilename(image.name);
    setImageUrl(URL.createObjectURL(image));
    onImageChange(currentIndex, image);
  };

  const clearImage = () => {
    imageInput.current.value = "";
    setFilename("No file chosen");
    setImageUrl(null);
    onImageChange(currentIndex, null);
  };

  const descriptionTextareaId = `poc-description-${currentIndex}-${pocDoc.key}`;
  const imageInputId = `poc-image-${currentIndex}-${pocDoc.key}`;
  const captionTextareaId = `poc-caption-${currentIndex}-${pocDoc.key}`;

  return (
    <PocTemplate
      {...{
        pocDoc,
        currentIndex,
        pocList,
        handleDrop,
        icon: mdiImage,
        onPositionChange,
        onRemovePoc,
        selectedPoc,
        setSelectedPoc,
        title: "Image",
      }}
    >
      <div className="poc-image col-span-8 grid">
        <label htmlFor={descriptionTextareaId}>Description</label>
        <Textarea
          value={pocDoc.description}
          id={descriptionTextareaId}
          onChange={onTextChange<PocImageDoc>(currentIndex, "description")}
        />
      </div>

      <Grid>
        <label
          htmlFor={imageInputId}
          onClick={e => {
            e.preventDefault();
          }}
        >
          Choose Image
        </label>
        <UploadFile
          inputId={imageInputId}
          filename={filename}
          inputRef={imageInput}
          name={"imagePoc"}
          accept={"image/png, image/jpeg"}
          onChange={onImageChangeWrapper}
          onButtonClick={clearImage}
        />
        {imageUrl && <img src={imageUrl} alt="Selected image preview" className="max-h-[550px] w-fit object-contain" />}
      </Grid>

      <div className="grid">
        <label htmlFor={captionTextareaId}>Caption</label>
        <input
          value={pocDoc.image_caption}
          id={captionTextareaId}
          onChange={onTextChange<PocImageDoc>(currentIndex, "image_caption")}
        />
      </div>
    </PocTemplate>
  );
}
