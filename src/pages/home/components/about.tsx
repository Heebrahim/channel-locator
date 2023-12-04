import {
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	ModalProps,
} from "@chakra-ui/react";

type Props = Pick<ModalProps, "isOpen" | "onClose"> & {
	type: "internal" | "external";
};

export function About({ type, ...props }: Props) {
	return (
		<Modal size="xl" isCentered {...props}>
			<ModalOverlay />

			<ModalContent
				className="!bg-no-repeat !bg-cover !bg-[#fcc508]"
				style={{ backgroundImage: "url(/intro.jpg)" }}
			>
				<ModalHeader className="!max-w-[65%]">
					<h1 className="text-6xl font-bold">Y'ello!</h1>
					<h6 className="text-base">
						Welcome to MTN Nigeria Coverage Locator Map
					</h6>
				</ModalHeader>

				<ModalCloseButton />

				<ModalBody className="!max-w-[70%]">
					<div className="pt-2 pb-8">
						{type === "internal" ? (
							<p>
								Coverage Locator application is a location
								intelligence solution which enables MTNN
								subscribers & retail staff at the walk-in
								centers to identify network coverage signal
								levels and report areas of poor network coverage
								by performing a street level search on the web
								map.
								<br />
								<br />
								Coverage locator will help drive 5G acceleration
								and sales of 5G devices to potential 5G
								customers. The solution will also provide access
								to socio-economic and household population data
								for Fixed Broadband. It will equally help the
								network planning team identify high value
								clusters with socio-economic indices which
								provide efficient broadband deployment and 5G
								roll out.
								<br />
								<br />
								Ultimately, Coverage Locator solution will help
								drive sales of data devices and increase data
								revenue.
							</p>
						) : (
							<p>
								This coverage locator is designed just for you,
								to effortlessly find network coverage signal
								levels on a map by searching any address. Plus,
								you can personally report areas with weak or no
								coverage and notify us about network outages, so
								we can make your experience even better.
							</p>
						)}
					</div>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
