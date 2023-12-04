export enum Tab {
  stores = "stores",
  coverages = "coverages",
}

export enum SearchType {
  all = "all",
  nearest = "nearest",
}

export type DrawEvent = { layerType: "circle" | "rectangle" | "polygon" } & (
  | { layers: L.FeatureGroup<L.Layer>; type: "draw:edited" | "draw:deleted" }
  | { layer: L.Layer; type: "draw:created" }
);

export type RouteResponse = {
  routes: Array<{
    duration: string;
    distanceMeters: number;
    polyline: {
      geoJsonLinestring: {
        coordinates: Array<[longitude: number, latitude: number]>;
      };
    };
  }>;
};