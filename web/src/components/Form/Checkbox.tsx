import Label from "./Label";

interface CheckboxProps {
  id: string;
  checked?;
  onChange?;
  label: string;
}

export default function Checkbox({ id, checked, onChange, label }: CheckboxProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="checkbox h-5 w-5 cursor-pointer"
      />
      <Label text={label} htmlFor={id} className="cursor-pointer text-sm" />
    </div>
  );
}
