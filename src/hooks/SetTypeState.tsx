import { useState } from "react";

type InputType = "password" | "text";

export default function setTypeState(): [
  InputType,
  boolean,
  () => void
] {
  const [type, setType] = useState<InputType>("password");
  const [eye, setEye] = useState<boolean>(false);

  const toggleType = () => {
    setType(prev => (prev === "password" ? "text" : "password"));
    setEye(prev => !prev);
  };

  return [type, eye, toggleType];
}
