import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface SearchBoxProps {
  placeholder: string;
  onChange: (value: string) => void;
}

export default function SearchBox({ placeholder, onChange }: SearchBoxProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const id = setTimeout(() => onChange(value), 300);
    return () => clearTimeout(id);
  }, [value, onChange]);

  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="max-w-xs"
    />
  );
}
