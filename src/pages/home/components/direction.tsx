import { Polyline, Popup, Tooltip } from "react-leaflet";
import { RouteResponse } from "../types";
import { Button } from "@chakra-ui/react";
import { Fragment } from "react";

export function Direction({
	routes,
	onClear,
}: {
	routes: RouteResponse['routes'];
	onClear(): void;
}) {
	return (
		<>
			{routes.map((route, i) => {
				return (
					<Fragment key={i}>
						<Polyline
							weight={12}
							color="#000"
							opacity={0.7}
							positions={
								route.polyline.geoJsonLinestring.coordinates
							}
						/>

						<Polyline
							weight={7}
							color="#0b99ff"
							positions={
								route.polyline.geoJsonLinestring.coordinates
							}
						>
							<Popup>
								<Button size="sm" onClick={() => onClear()}>
									Clear
								</Button>
							</Popup>

							<Tooltip>
								<div>
									<p>
										<strong>
											Distance:{" "}
											{route.distanceMeters / 1000} km
										</strong>
									</p>
									<p>
										<span>Duration: </span>

										<span>
											{(
												parseFloat(route.duration) / 60
											).toFixed(2)}
										</span>

										<span> minute(s)</span>
									</p>
								</div>
							</Tooltip>
						</Polyline>
					</Fragment>
				);
			})}
		</>
	);
}
