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

export function createPOSIcon() {
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

export function createBranchIcon() {
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

export function createATMIcon(){
  return L.divIcon({
    className: "",
    iconSize: [24, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    html: `
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="24" fill="#000"/>
    <path d="M34.5 22.0081L32.9262 15.4379C32.6504 14.2917 31.4888 13.5717 30.3362 13.8545C29.3224 14.1022 28.8296 14.8043 28.6299 15.2984C28.3938 15.8814 27.3397 18.5233 27.0933 19.0693C27.0069 19.2587 26.8245 19.3585 26.7874 19.3752C26.5781 19.468 24.4834 20.3518 24.4834 20.3518V20.3557C24.2749 20.4517 24.0983 20.6054 23.9743 20.7985C23.8502 20.9916 23.7839 21.2161 23.7832 21.4456C23.7832 22.1131 24.3298 22.6545 25.0037 22.6545C25.149 22.6545 25.2872 22.6245 25.4171 22.5784V22.5829L28.1979 21.427C28.5794 21.2491 28.7656 21.0238 28.955 20.6955C29.0344 20.5573 29.2757 19.9787 29.4722 19.5038L31.1502 26.5214L31.1483 37.395C31.1451 38.4753 31.8914 39.356 32.9819 39.3598C34.0738 39.3637 34.8629 38.4913 34.8699 37.4091L34.8808 24.5752C34.8795 23.9717 34.6395 22.5374 34.5 22.0081Z" fill="#Fff"/>
    <path d="M28.4145 13.5297C29.7771 13.5297 30.8817 12.4352 30.8817 11.0849C30.8817 9.73471 29.7771 8.64014 28.4145 8.64014C27.0519 8.64014 25.9473 9.73471 25.9473 11.0849C25.9473 12.4352 27.0519 13.5297 28.4145 13.5297Z" fill="#FFf"/>
    <path d="M23.7796 24.2374H23.7822L19.9582 16.5657L19.9575 16.5727C19.8147 16.2777 19.5914 16.029 19.3135 15.8552C19.0355 15.6814 18.7141 15.5896 18.3863 15.5903H14.8619C13.8999 15.5897 13.1191 16.3628 13.1191 17.3164V39.3599H23.9774V25.1027C23.9764 24.8031 23.9089 24.5076 23.7796 24.2374Z" fill="#FFf"/>
    </svg>
    `
  })
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
