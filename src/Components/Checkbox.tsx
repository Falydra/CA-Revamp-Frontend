import React from "react";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "checked"> {
  onCheckedChange?: (checked: boolean) => void;
  checked?: boolean | "indeterminate";
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ onCheckedChange, checked, ...props }, ref) => {
    const internalRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => internalRef.current!);

    
    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = checked === "indeterminate";
      }
    }, [checked]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(event.target.checked);
      }
    };

    return (
      <input
        type="checkbox"
        ref={internalRef}
  
        checked={checked === "indeterminate" ? false : checked}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

Checkbox.displayName = "Checkbox";


export default Checkbox;