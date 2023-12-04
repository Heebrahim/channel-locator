import { Spinner } from "@chakra-ui/react";

export function Loader() {
	return (
		<div className="h-full flex flex-col">
			<Spinner className="m-auto" />
		</div>
	);
}
