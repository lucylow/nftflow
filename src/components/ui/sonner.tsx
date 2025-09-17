import React from "react";

// Mock theme hook for now
const useTheme = () => ({ theme: "system" });

type ToasterProps = React.HTMLAttributes<HTMLDivElement>;

const toast = {
  success: (message: string) => console.log("Success:", message),
  error: (message: string) => console.log("Error:", message),
  info: (message: string) => console.log("Info:", message),
};

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <div
      className="fixed bottom-4 right-4 z-50"
      {...props}
    />
  );
};

export { Toaster, toast };