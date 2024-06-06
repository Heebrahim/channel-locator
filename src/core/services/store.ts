import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

import { Feature, Geometry } from "geojson";
import { Store } from "../models/store";
import { StoreRepository, Variant } from "../repository/store/contract";

function extractData(variant: Variant) {
  return (
  data: Feature<Geometry, any>,
): Feature<Geometry, Store> => {
  return {
    ...data,
    properties: {
      id: data.id as any,
      address: 
        variant === Variant.branch
          ? data.properties.BRANC_ADD
          : variant === Variant.pos
          ? data.properties.Address_li
          : data.properties.Address,
      color: data.properties.Colour_Scheme ?? "#0b99ff",
      latitude:
        variant === Variant.branch
          ? data.properties.Latitude
          : variant === Variant.pos
          ? data.properties.Latitude
          : data.properties.Latitude,
      longitude:
        variant === Variant.branch
          ? data.properties.Longitude
          : variant === Variant.pos
          ? data.properties.Longitude
          : data.properties.Longitude,
      lga: data.properties.LGA ?? "",
      branch_name:
        variant === Variant.branch
          ? data.properties.BRANC_NAME
          : variant === Variant.pos
          ? data.properties.Agent_name
          : data.properties.branch_nam,

      region: data.properties.Region ?? "",

      state: data.properties.State ?? "",
      tel:
        variant === Variant.branch
          ? data.properties.Supervisors_MSISDN
          : `+234 ${data.properties.Msisdn}`,
      type: variant === Variant.branch ? data.properties.Type : "",
    },
  };
}
}

export function getStores(variant: Variant) {
  return pipe(
    Effect.flatMap(StoreRepository, (repo) => repo.findAll(variant)),
    // Effect.map((result) => result.features),
    Effect.map((_) => ({ ..._, features: _.features.map(extractData(variant)) })),
    // Effect.flatMap(S.parseEither(S.array(Store)))
  );
}

export function getNearestStores(
  latlng: { lat: number; lng: number },
  variant: Variant,
) {
  return pipe(
    Effect.flatMap(StoreRepository, (repo) =>
      repo.findNearestTo(latlng, variant),
    ),
    Effect.map((_) => ({
      ..._,
      features: _.features.map(extractData(variant)),
    })),
    // Effect.map((result) => result.features),
    // Effect.map(A.map(extractData)),
    // Effect.flatMap(S.parseEither(S.array(Store)))
  );
}
