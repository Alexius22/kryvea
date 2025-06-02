import { useState } from "react";
import Button from "../Button";

type Props = {
  label?: string;
  icon?: string;
  accept?: string;
  color: string;
  isRoundIcon?: boolean;
};

const FormFilePicker = ({ label, icon, accept, color, isRoundIcon }: Props) => {
  const [file, setFile] = useState(null);

  const handleFileChange = event => {
    setFile(event.currentTarget.files[0]);
  };

  const showFilename = !isRoundIcon && file;

  return (
    <div className="relative flex items-stretch justify-start">
      <label className="inline-flex">
        <Button
          className={`${isRoundIcon ? "h-12 w-12" : ""} ${showFilename ? "rounded-r-none" : ""}`}
          iconSize={isRoundIcon ? 24 : undefined}
          label={isRoundIcon ? null : label}
          icon={icon}
          color="red"
          roundedFull={isRoundIcon}
          asAnchor
        />
        <input
          type="file"
          className="-z-1 absolute left-0 top-0 h-full w-full cursor-pointer opacity-0 outline-none"
          onChange={handleFileChange}
          accept={accept}
        />
      </label>
      {showFilename && (
        <div className="max-w-full flex-grow-0 overflow-x-hidden rounded-r border border-gray-200 bg-gray-100 px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
          <span className="line-clamp-1 max-w-full text-ellipsis">{file.name}</span>
        </div>
      )}
    </div>
  );
};

export default FormFilePicker;
