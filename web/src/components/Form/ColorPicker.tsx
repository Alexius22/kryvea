import { useEffect, useRef, useState } from "react";
import { RgbaColor, RgbaColorPicker } from "react-colorful";
import Button from "./Button";
import Input from "./Input";

function parseRgba(rgbaStr: string): RgbaColor {
  const match = rgbaStr.match(/rgba?\((\d+), (\d+), (\d+),? ([\d.]+)?\)/);
  if (!match) return { r: 0, g: 0, b: 0, a: 1 };
  const [, r, g, b, a = "1"] = match;
  return { r: +r, g: +g, b: +b, a: +a };
}

function toRgbaString({ r, g, b, a }: RgbaColor): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function hexToRgba(hex: string): RgbaColor {
  const clean = hex.replace("#", "");

  if (![6, 8].includes(clean.length)) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const a = clean.length === 8 ? parseInt(clean.slice(6, 8), 16) / 255 : 1;

  return { r, g, b, a };
}

function rgbaToHex({ r, g, b, a }: RgbaColor): string {
  const alpha = Math.round((a ?? 1) * 255);
  return "#" + [r, g, b, alpha].map(v => v.toString(16).padStart(2, "0")).join("");
}

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

  const [internalColor, setInternalColor] = useState<RgbaColor>(parseRgba(value));
  const [hexInput, setHexInput] = useState("#000000");

  useEffect(() => {
    const parsed = parseRgba(value);
    const isEqual =
      parsed.r === internalColor.r &&
      parsed.g === internalColor.g &&
      parsed.b === internalColor.b &&
      parsed.a === internalColor.a;

    if (!isEqual) {
      setInternalColor(parsed);
      setHexInput(rgbaToHex(parsed));
    }
  }, [value]);

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

  const handleChange = (color: RgbaColor) => {
    setInternalColor(color);
    setHexInput(rgbaToHex(color));
    onChange(toRgbaString(color));
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setHexInput(hex);
    if (/^#?[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(hex)) {
      const color = hexToRgba(hex);
      handleChange(color);
    }
  };

  return (
    <div className="relative inline-block" ref={pickerRef}>
      <Button icon={icon} title={title} onClick={() => setOpen(o => !o)} />

      {open && (
        <div className="absolute z-20 flex flex-col gap-2 rounded p-2">
          <RgbaColorPicker color={internalColor} onChange={handleChange} />
          <Input
            type="text"
            value={hexInput}
            className="px-2 py-1 text-center text-sm"
            onChange={handleHexChange}
            placeholder="#rrggbbaa"
          />
        </div>
      )}
    </div>
  );
}
