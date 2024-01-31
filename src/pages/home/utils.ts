import L, { LatLngBoundsExpression } from "leaflet";
import { apiUrl, internalAppUrl, spectrumServerUrl } from "./env";

import * as Effect from "@effect/io/Effect";

import * as E from "@effect/data/Either";
import { pipe } from "@effect/data/Function";
import * as O from "@effect/data/Option";
import * as S from "@effect/data/String";

import * as Http from "http-kit";
import * as HttpRes from "http-kit/response";

import { SessionStorageLive } from "@/core/adapters/storage/implementation";
import { DataLayer } from "@/core/models/data-layer";
import { getAuthentication } from "@/core/services/authentication";
import { createFeatureService } from "@/core/tags/spectrum";
import { LatLng } from "@/core/types/misc";
import { json } from "http-kit/body";
import { RouteResponse, Tab } from "./types";

export const isOnInternalUrl = window.location.href === internalAppUrl;

export function isInternalUser() {
  //if (import.meta.env.DEV) return true;

  const auth = pipe(
    getAuthentication(),
    Effect.provideLayer(SessionStorageLive),
    Effect.either,
    Effect.runSync
  );

  return E.isRight(auth) || (isOnInternalUrl && E.isRight(auth));
}

// Zoom value to keep the entire boundary of Nigeria inview, excluding other countries
export const defaultZoom = 6.5;

export const defaultCenter = { lat: 9.1715156, lng: 4.0128317 };

// Bounds representing Nigeria
export const maxMapViewBounds: LatLngBoundsExpression = [
  [4, 2.5],
  [14, 15],
];

const markerIcon = L.icon({
  iconSize: [40, 50],
  // iconAnchor: [20, 50],
  // popupAnchor: [0, -50],
  iconUrl: "/marker.png",
});

export const markerProps = {
  autoPan: true,
  draggable: true,
  icon: markerIcon,
};

export const drawOptions = {
  circle: true,
  marker: false,
  polygon: true,
  polyline: false,
  rectangle: false,
  circlemarker: false,
};

export const featureServiceUrl = `${spectrumServerUrl}/rest/Spatial/FeatureService`;

export const tileService = `${spectrumServerUrl}/rest/Spatial/MapTilingService`;

export const mappingService = `${spectrumServerUrl}/rest/Spatial/MappingService`;

// export const storesMapName = "/COVERAGES/NamedMaps/MTNN Walk-in Shops";

export const layerURL = `${apiUrl}/home/layer-tile`;

export function getFeatureService() {
  return createFeatureService(featureServiceUrl);
}

export function createStoreIcon(color = /* MTN Yellow */ "#FFC403") {
  return L.divIcon({
    className: "",
    iconSize: [24, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    html: /* html */ `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" version="1.1" style="shape-rendering:geometricPrecision;text-rendering:geometricPrecision;image-rendering:optimizeQuality;" viewBox="0 0 333 416.25" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd"><defs><style type="text/css">
   
    .fil0 {fill:black}
   
  </style></defs><g><path class="fil0" d="M167 33c34,0 61,28 61,62 0,34 -27,61 -61,61 -34,0 -62,-27 -62,-61 0,-34 28,-62 62,-62zm0 134c64,0 115,51 115,115 0,6 0,12 -1,18l-229 0c-1,-6 -1,-12 -1,-18 0,-64 52,-115 116,-115z"/></g></svg>
    `,
  });
}

export function createBranchIcon(color = /* MTN Yellow */ "#FFC403") {
  return L.divIcon({
    className: "",
    iconSize: [24, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    html: /* html */ `
    <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 115.44"><defs><style>.cls-1{fill-rule:evenodd;}</style></defs><title>bank</title><path  class="cls-1" d="M2.79,48.12,61.44,0l58.94,48.12ZM61.44,24.26A4.73,4.73,0,1,1,56.71,29a4.73,4.73,0,0,1,4.73-4.73Zm0-4.8A9.53,9.53,0,1,1,51.91,29a9.53,9.53,0,0,1,9.53-9.53Zm8.67,1.82a11.6,11.6,0,1,1-8-3.87,11.6,11.6,0,0,1,8,3.87Zm-8.67-6.43A14.14,14.14,0,1,1,47.3,29,14.14,14.14,0,0,1,61.44,14.85ZM0,108.81H9.08v-6.33H10.4v-3h3.84V63.23H6.38V54.55H116.49v8.68h-7.85V99.46h3.84v3h1.32v6.33h9.08v6.63H0v-6.63Zm32.59-6.33H37v-3h3.85V63.23H28.74V99.46h3.85v3Zm26.63,0h4.44v-3h3.85V63.23H55.37V99.46h3.85v3Zm26.63,0h4.44v-3h3.85V63.23H82V99.46h3.85v3Z"/></svg>
    `,
  });
}

export function groupLayerAttributesByCategory(layer: DataLayer) {
  type Attr = DataLayer["attributes"][number];

  return layer.attributes.reduce((acc, layer) => {
    const existing = acc[layer.category] ?? [];
    acc[layer.category] = [...existing, layer];
    return acc;
  }, {} as Record<Attr["category"], Array<Attr>>);
}

export const scalesByZoomLevel: Record<number, string> = {
  0: "1 : 500,000,000",
  1: "1 : 250,000,000",
  2: "1 : 150,000,000",
  3: "1 : 70,000,000",
  4: "1 : 35,000,000",
  5: "1 : 15,000,000",
  6: "1 : 10,000,000",
  7: "1 : 4,000,000",
  8: "1 : 2,000,000",
  9: "1 : 1,000,000",
  10: "1 : 500,000",
  11: "1 : 250,000",
  12: "1 : 150,000",
  13: "1 : 70,000",
  14: "1 : 35,000",
  15: "1 : 15,000",
  16: "1 : 8,000",
  17: "1 : 4,000",
  18: "1 : 2,000",
  19: "1 : 1,000",
};

export function stringToNumber(str: string | null) {
  const val =
    typeof str === "string" && str.trim() !== ""
      ? Number(str)
      : typeof str === "number"
      ? str
      : null;

  return val !== null && Number.isNaN(val) ? null : val;
}

export enum GeolocationPositionErrorCode {
  PERMISSION_DENIED = 1,
  POSITION_UNAVAILABLE = 2,
  TIMEOUT = 3,
}

export function getCurrentPosition() {
  return Effect.async<never, GeolocationPositionError, GeolocationPosition>(
    (resume) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resume(Effect.succeed(position)),
        (error) => resume(Effect.fail(error))
      );
    }
  );
}

export function getTab(str: string | null) {
  return pipe(
    O.fromNullable(str),
    O.filter(S.isNonEmpty),
    O.filter((_) => _ == Tab.stores || _ == Tab.branches),
    O.getOrElse(() => Tab.stores)
  );
}

export function toNumber(n: string | null) {
  return pipe(
    O.fromNullable(n),
    O.map(parseFloat),
    O.filter((_) => !Number.isNaN(_))
  );
}

export function parseLatLng(str: string | null) {
  return pipe(
    O.fromNullable(str),
    O.map(S.split(",")),
    O.map(([lat, lng]) => ({ lat: toNumber(lat), lng: toNumber(lng) })),
    O.flatMap(O.all)
  );
}

export function computeRoute(param: {
  to: LatLng;
  from: LatLng;
  apiKey: string;
  routeMask: Readonly<Array<"duration" | "polyline" | "distanceMeters">>;
}) {
  const url = "https://routes.googleapis.com/directions/v2:computeRoutes";

  const masks = param.routeMask.map((mask) => `routes.${mask}`);

  const data = json({
    travelMode: "DRIVE",
    polylineEncoding: "GEO_JSON_LINESTRING",
    // computeAlternativeRoutes: false,
    routingPreference: "TRAFFIC_AWARE",
    origin: {
      location: {
        latLng: {
          latitude: param.from.lat,
          longitude: param.from.lng,
        },
      },
    },
    destination: {
      location: {
        latLng: {
          latitude: param.to.lat,
          longitude: param.to.lng,
        },
      },
    },
  });

  return pipe(
    Http.post(url, data, {
      headers: {
        "X-Goog-Api-Key": param.apiKey,
        "X-Goog-FieldMask": masks.join(","),
      },
    }),
    HttpRes.filterStatusOk(),
    HttpRes.toJson<RouteResponse>()
  );
}

export function nonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

// const coverageSignalScale: Record<CoverageSignal["signalClass"], number> = {
//   LOW: 0,
//   MODERATE: 1,
//   GOOD: 2,
//   EXCELLENT: 3,
// };

// export function sortCoverageSignals(signals: Array<CoverageSignal>) {
//   return signals.sort(
//     (a, b) =>
//       coverageSignalScale[a.signalClass] - coverageSignalScale[b.signalClass],
//   );
// }
