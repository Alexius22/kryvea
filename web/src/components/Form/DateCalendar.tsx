import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateTime, getUserDateFormatPattern } from "../../utils/dates";
import Grid from "../Composition/Grid";
import Label from "./Label";

interface DateCalendarProps {
  idStart: string;
  label: string;
  isRange?: boolean;
  showTime?: boolean;
  value: { start: string; end?: string };
  onChange: (value: string | { start: string; end: string }) => void;
  placeholder?: string | { start?: string; end?: string };
}

export default function DateCalendar({
  idStart,
  label,
  isRange = false,
  showTime = false,
  value,
  onChange,
  placeholder,
}: DateCalendarProps) {
  const parseValueToDateRange = (value: { start: string; end?: string }): [Date | null, Date | null] => [
    value.start ? new Date(value.start) : null,
    value.end ? new Date(value.end) : null,
  ];

  const [range, setRange] = useState<[Date | null, Date | null]>(() => parseValueToDateRange(value));

  useEffect(() => {
    setRange(parseValueToDateRange(value));
  }, [value.start, value.end]);

  // Handler for single date change
  const handleChangeSingle = (date: Date | null) => {
    onChange(date.toISOString());
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
    <Grid>
      {label && <Label text={label} htmlFor={isRange ? undefined : idStart} />}
      <div>
        {isRange ? (
          <DatePicker
            selectsRange
            swapRange
            startDate={range[0]}
            endDate={range[1]}
            dateFormat={getUserDateFormatPattern()}
            onChange={handleChangeRange}
            className="datepicker-input"
            placeholderText={"Select range date"}
            autoComplete="off"
          />
        ) : (
          <DatePicker
            selected={new Date(value.start)}
            onChange={handleChangeSingle}
            showTimeSelect={showTime}
            timeIntervals={15}
            todayButton={showTime ? "Today" : false}
            dateFormat={
              showTime
                ? `${formatDateTime(value.start)[0]} ${formatDateTime(value.start)[1]} '${formatDateTime(value.start)[2]}'`
                : `${formatDateTime(value.start)[0].slice(0, -1)}`
            }
            className="datepicker-input"
            placeholderText={typeof placeholder === "string" ? placeholder : "Select a date"}
            id={idStart}
            autoComplete="off"
          />
        )}
      </div>
    </Grid>
  );
}
