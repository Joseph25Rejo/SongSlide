import React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { ButtonProps } from "@/components/ui/button";

const CustomButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    // Filter out the fdprocessedid attribute
    const filteredProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => key !== 'fdprocessedid')
    );
    
    return <ShadcnButton ref={ref} {...filteredProps} />;
  }
);

CustomButton.displayName = "CustomButton";

export default CustomButton;