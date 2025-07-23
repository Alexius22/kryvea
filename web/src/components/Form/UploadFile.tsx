import Grid from "../Composition/Grid";
import Button from "./Button";
import Label from "./Label";

type UploadFileProps = {
  label?: string;
  inputId;
  filename;
  inputRef?;
  name;
  accept;
  onChange;
  onButtonClick;
};

export default function UploadFile({
  label,
  inputId,
  filename,
  inputRef,
  name,
  accept,
  onChange,
  onButtonClick,
}: UploadFileProps) {
  return (
    <Grid>
      {label && <Label text={label} htmlFor={inputId} />}
      <div className="flex gap-4">
        <label
          className="clickable flex h-12 w-1/2 min-w-40 cursor-pointer items-center gap-2 overflow-hidden rounded-lg bg-[color:--bg-quaternary] p-2"
          htmlFor={inputId}
        >
          <span className="shrink-0 text-nowrap rounded-md border border-[color:--border-primary] bg-[color:--bg-tertiary] px-[6px] py-[1px]">
            Choose File
          </span>
          <span className="truncate before:empty:font-thin before:empty:text-[color:--text-secondary] before:empty:content-['No_file_chosen']">
            {filename}
          </span>
        </label>
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          name={name}
          accept={accept}
          id={inputId}
          onChange={onChange}
        />
        <Button text="Clear" className="rounded-xl" onClick={onButtonClick} variant="danger" />
      </div>
    </Grid>
  );
}
