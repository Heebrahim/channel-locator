import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from "@chakra-ui/react";
import {  formatString, isInternalUser } from "../utils";
import { useMemo } from "react";
import { getAuth } from "@/common/authUtil";

type Props = Pick<ModalProps, "isOpen" | "onClose"> & {
  type: "internal" | "external";
};

export function About({ type, ...props }: Props) {

  const internalUser = useMemo(() => isInternalUser(), []);
  const auth = getAuth()
  // @ts-expect-error
  const tableName = auth?.right?.organisation?.tableName

  return (
    <Modal size={internalUser ? "2xl" : "xl"} isCentered {...props}>
      <ModalOverlay />

      <ModalContent
        className="!bg-no-repeat !bg-cover !bg-[--brand]"
        //style={{ backgroundImage: "url(/intro.jpg)" }}     
      >
        <ModalHeader className="!max-w-[65%] text-white">
          <h1 className="text-5xl font-bold">Welcome to {formatString(tableName)} Channel Locator</h1>
          <h6 className="text-base">Welcome to Channel Locator Map</h6>
        </ModalHeader>

        <ModalCloseButton />

				<ModalBody className="!max-w-[70%]">
          <div className="pt-2 pb-8">
            {type === "internal" ? (
              <p className="">                
              </p>
            ) : (
              <p className="" >
              </p>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
