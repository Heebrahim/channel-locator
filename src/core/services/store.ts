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
      address: data.properties.Address ?? "",
      color: data.properties.Colour_Scheme ?? "#ffc403",
      latitude:
        variant === Variant.store
          ? data.properties.Latitude
          : data.properties.Latitutde,
      longitude:
        variant === Variant.store
          ? data.properties.Longitude
          : data.properties.Longitutde,
      lga: data.properties.LGA ?? "",
      name:
        variant === Variant.store
          ? data.properties.New_Shop_Name
          : data.properties.Name,
      region: data.properties.Region ?? "",
      state: data.properties.State ?? "",
      tel:
        variant === Variant.store
          ? data.properties.Supervisors_MSISDN
          : `+234 ${data.properties.Msisdn}`,
      type: variant === Variant.store ? data.properties.Type : "",
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
