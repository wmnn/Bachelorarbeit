import React, { forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => {
    return (
      <input
        {...props}
        ref={ref}
        className={`p-2 border-gray-200 border-[1px] rounded-l ${props.className || ''}`}
      />
    );
  }
);

Input.displayName = 'Input'; // For better debugging in React DevTools
