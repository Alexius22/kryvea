import { useEffect, useRef, useState } from "react";
import { ChromePicker, ColorResult } from "react-color";
import Button from "./Button";

export default function ColorPicker({
  value,
  icon,
  onChange,
  title = "Pick a color",
}: {
  value: string;
  icon?: string;
  onChange: (color: string) => void;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (color: ColorResult) => {
    const { r, g, b, a } = color.rgb;
    const rgba = `rgba(${r}, ${g}, ${b}, ${a ?? 1})`;
    onChange(rgba);
  };

  return (
    <div className="relative inline-block" ref={pickerRef}>
      <Button icon={icon} title={title} onClick={() => setOpen(o => !o)} />

      {open && (
        <div className="absolute z-20 mt-2 shadow-lg">
          <ChromePicker color={value} onChange={handleChange} />
        </div>
      )}
    </div>
  );
}
