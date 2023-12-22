import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from "@chakra-ui/react";
import { isInternalUser } from "../utils";
import { useMemo } from "react";

type Props = Pick<ModalProps, "isOpen" | "onClose"> & {
  type: "internal" | "external";
};



export function About({ type, ...props }: Props) {

  const internalUser = useMemo(() => isInternalUser(), []);

  return (
    <Modal size={internalUser ? "2xl" : "xl"} isCentered {...props}>
      <ModalOverlay />

      <ModalContent
        className="!bg-no-repeat !bg-cover !bg-[#1E90FF]"
        style={{ backgroundImage: "url(/intro.jpg)" }}     
      >
        <ModalHeader className="!max-w-[65%]">
          <h1 className="text-5xl font-bold">Stanbic!</h1>
          <h6 className="text-base">Welcome to Stanbic Banks branches Locator Map</h6>
        </ModalHeader>

        <ModalCloseButton />

				<ModalBody className="!max-w-[70%]">
          <div className="pt-2 pb-8">
            {type === "internal" ? (
              <p className="">
                Coverage Locator application is a location intelligence solution
                which enables MTNN subscribers & retail staff at the walk-in
                centers to identify network coverage signal levels and report
                areas of poor network coverage by performing a street level
                search on the web map.
                <br />
                <br />
                Coverage locator will help drive 5G acceleration and sales of 5G
                devices to potential 5G customers. The solution will also
                provide access to socio-economic and household population data
                for Fixed Broadband. It will equally help the network planning
                team identify high value clusters with socio-economic indices
                which provide efficient broadband deployment and 5G roll out.
                <br />
                <br />
                Ultimately, Coverage Locator solution will help drive sales of
                data devices and increase data revenue.
              </p>
            ) : (
              <p className="" >
                This stanbic locator is designed just for you, to effortlessly
                find any stanbic bank closest to you on a map by searching any
                address. Plus, you can personally report branches with poor
                customer service or areas with no bank services, so we can make
                your experience even better.
              </p>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
