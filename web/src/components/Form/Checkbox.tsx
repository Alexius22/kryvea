interface CheckboxProps {
  id: string;
  checked?;
  onChange?;
  htmlFor;
  label: string;
}

export default function Checkbox({ id, checked, onChange, htmlFor, label }: CheckboxProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="checkbox h-5 w-5 cursor-pointer"
      />
      <label htmlFor={htmlFor} className="cursor-pointer text-sm">
        {label}
      </label>
    </div>
  );
}
