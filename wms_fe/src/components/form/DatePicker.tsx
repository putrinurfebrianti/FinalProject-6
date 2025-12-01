import React, { forwardRef, useRef, useImperativeHandle } from "react";
import Flatpickr from "react-flatpickr";

type DatePickerProps = {
  value?: Date | string | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  options?: any;
  id?: string;
  required?: boolean;
};

const DatePicker = forwardRef<any, DatePickerProps>(
  ({ value, onChange, placeholder, className, wrapperClassName, options, id, required }, ref) => {
    const pickerRef = useRef<any>(null);

    // Expose flatpickr instance for parent usage (open/close)
    useImperativeHandle(ref, () => pickerRef.current, [pickerRef]);

    const selected = React.useMemo(() => {
      if (!value) return null;
      if (value instanceof Date) return value;
      // Accept YYYY-MM-DD strings
      try {
        const d = new Date(String(value));
        if (isNaN(d.getTime())) return null;
        return d;
      } catch (err) {
        return null;
      }
    }, [value]);

    return (
        <div className={wrapperClassName ?? "relative w-full flatpickr-wrapper"} onClick={() => pickerRef.current?.flatpickr?.open?.()}>
        <Flatpickr
          id={id}
          ref={pickerRef}
          value={selected ?? undefined}
          required={required}
          onChange={(d: Date[]) => onChange?.(d?.[0] ?? null)}
          options={{
            dateFormat: "Y-m-d",
            allowInput: false,
            clickOpens: true,
            appendTo: (typeof document !== "undefined" ? document.body : undefined),
            ...options,
          }}
          placeholder={placeholder}
          className={className}
        />
      </div>
    );
  }
);

export default DatePicker;
