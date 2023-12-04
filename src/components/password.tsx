import {
  Input,
  Button,
  InputProps,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { useState } from "react";

export function PasswordInput(props: InputProps) {
  const [show, setShow] = useState(false);

  const onClick = () => setShow((t) => !t);

  return (
    <InputGroup>
      <Input {...props} pr="4.5rem" type={show ? "text" : "password"} />

      <InputRightElement minW="4.5rem">
        <Button size="sm" onClick={onClick}>
          {show ? "Hide" : "Show"}
        </Button>
      </InputRightElement>
    </InputGroup>
  );
}
