import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Label from "./Label";

interface CustomDatePickerProps {
  idStart: string;
  idEnd?: string; // required only for range
  label: string;
  isRange?: boolean;
  value: string | { start: string; end: string };
  onChange: (value: string | { start: string; end: string }) => void;
  placeholder?: string | { start?: string; end?: string };
}

export default function DateCalendar({
  idStart,
  idEnd,
  label,
  isRange = false,
  value,
  onChange,
  placeholder,
}: CustomDatePickerProps) {
  const startDate = isRange
    ? (value as { start: string; end: string }).start
      ? new Date((value as { start: string; end: string }).start)
      : null
    : (value as string)
      ? new Date(value as string)
      : null;

  const endDate =
    isRange && idEnd
      ? (value as { start: string; end: string }).end
        ? new Date((value as { start: string; end: string }).end)
        : null
      : null;

  const [range, setRange] = useState<[Date | null, Date | null]>([startDate, endDate]);

  useEffect(() => {
    if (isRange) {
      setRange([startDate, endDate]);
    }
  }, [isRange]);

  // Handler for single date change
  const handleChangeSingle = (date: Date | null) => {
    onChange(date ? date.toISOString() : "");
  };

  // Handler for range change
  const handleChangeRange = (dates: [Date | null, Date | null]) => {
    setRange(dates);
    const [start, end] = dates;
    onChange({
      start: start ? start.toISOString() : "",
      end: end ? end.toISOString() : "",
    });
  };

  return (
    <div>
      {label && <Label text={label} htmlFor={isRange ? undefined : idStart} />}
      {isRange && idEnd ? (
        <DatePicker
          selectsRange
          swapRange
          startDate={range[0]}
          endDate={range[1]}
          onChange={handleChangeRange}
          className="datepicker-input"
          placeholderText={"Select range date"}
          shouldCloseOnSelect={false}
          autoComplete="off"
        />
      ) : (
        <DatePicker
          selected={startDate}
          onChange={handleChangeSingle}
          className="datepicker-input"
          placeholderText={typeof placeholder === "string" ? placeholder : "Select a date"}
          id={idStart}
          autoComplete="off"
          inline
        />
      )}
    </div>
  );
}
