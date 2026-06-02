import { useState } from "react";
import { sanitizeDateInput, parseDisplayDateToIso, formatDateForDisplay, normalizeToIsoDate } from "../util/dateInput.js";

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
  const [prevValue, setPrevValue] = useState(value);
  const [localVal, setLocalVal] = useState(() => {
    return value ? formatDateForDisplay(value) : "";
  });
  const [expectedIso, setExpectedIso] = useState(() => {
    return value ? normalizeToIsoDate(value) : "";
  });

  // Adjust state during render when 'value' prop changes externally
  if (value !== prevValue) {
    setPrevValue(value);
    const normalizedProp = value ? normalizeToIsoDate(value) : "";
    if (normalizedProp !== expectedIso) {
      setLocalVal(value ? formatDateForDisplay(value) : "");
      setExpectedIso(normalizedProp);
    }
  }

  const handleChange = (event) => {
    const rawVal = event.target.value;
    const sanitized = sanitizeDateInput(rawVal);
    setLocalVal(sanitized);

    const isoVal = parseDisplayDateToIso(sanitized);
    setExpectedIso(isoVal);

    onChange?.({
      target: {
        value: isoVal,
        name,
        id,
      },
    });
  };

  return (
    <input
      {...rest}
      id={id}
      name={name}
      type="text"
      value={localVal}
      onChange={handleChange}
      className={className}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
    />
  );
};

export default DateInput;
