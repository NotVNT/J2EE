import { useEffect, useState } from "react";
import {
  formatDateForDisplay,
  parseDisplayDateToIso,
  sanitizeDateInput,
} from "../util/dateInput.js";

const DateInput = ({
  value,
  onChange,
  className = "",
  placeholder = "dd/mm/yyyy",
  id,
  name,
  disabled = false,
  required = false,
  ...rest
}) => {
  const [displayValue, setDisplayValue] = useState(() => formatDateForDisplay(value));

  useEffect(() => {
    setDisplayValue(formatDateForDisplay(value));
  }, [value]);

  const emitValue = (nextValue) => {
    onChange?.({
      target: {
        value: nextValue,
        name,
        id,
      },
    });
  };

  const handleChange = (event) => {
    const nextDisplayValue = sanitizeDateInput(event.target.value);
    setDisplayValue(nextDisplayValue);

    if (!nextDisplayValue) {
      emitValue("");
      return;
    }

    const isoDate = parseDisplayDateToIso(nextDisplayValue);
    if (isoDate) {
      emitValue(isoDate);
    }
  };

  const handleBlur = () => {
    if (!displayValue) {
      setDisplayValue("");
      return;
    }

    const isoDate = parseDisplayDateToIso(displayValue);
    if (!isoDate) {
      setDisplayValue(formatDateForDisplay(value));
      return;
    }

    const normalizedDisplayValue = formatDateForDisplay(isoDate);
    setDisplayValue(normalizedDisplayValue);

    if (isoDate !== value) {
      emitValue(isoDate);
    }
  };

  return (
    <input
      {...rest}
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      required={required}
      maxLength={10}
    />
  );
};

export default DateInput;
