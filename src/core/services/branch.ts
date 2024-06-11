import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Either from "@effect/data/Either"



import { Feature, FeatureCollection, Geometry } from "geojson";
import { Branch } from "../models/branch";
import { BranchRepository, Variant } from "../repository/branch/contract";
import { getAuth } from "@/common/authUtil";




const auth = getAuth()
Either.isRight(auth) ? console.log(auth.right.roles) : console.log("NO")






function extractCompetitors(currentUserBank: string){
  return (
    data: FeatureCollection,
  ): FeatureCollection => {
    return {
      ...data,
      features: data.features.filter(feature => feature.properties?.BANK_NAME !== currentUserBank)
    }
  }
}

function extractData(variant: Variant) {
  return (
  data: Feature<Geometry, any>,
): Feature<Geometry, Branch> => {
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
          : data.properties.BRANC_NAME,
      bank_name:
      variant === Variant.branch
        ? data.properties.BANK_NAME
        : variant === Variant.pos
        ? data.properties.Agent_name
        : data.properties.BANK_NAME,
  

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

export function getBranches(variant: Variant) {
  return pipe(
    Effect.flatMap(BranchRepository, (repo) => repo.findAll(variant)),
    // Effect.map((result) => result.features),
    Effect.map((_) => ({ ..._, features: _.features.map(extractData(variant)) })),
    // Effect.flatMap(S.parseEither(S.array(Branch)))
  );
}




export function getCompetitors(variant: Variant) {
  return pipe(
    Effect.flatMap(BranchRepository, (repo) => repo.findAllCompetitors(variant)),
    Effect.map((data) => 
      extractCompetitors("FCMB")(data) 
    ),
    // Effect.map((result) => result.features),
    Effect.map((_) => ({ ..._, features: _.features.map(extractData(variant)) })),
    // Effect.flatMap(S.parseEither(S.array(Branch)))
  );
}




export function getNearestBranches(
  latlng: { lat: number; lng: number },
  variant: Variant,
) {
  return pipe(
    Effect.flatMap(BranchRepository, (repo) =>
      repo.findNearestTo(latlng, variant),
    ),
    Effect.map((_) => ({
      ..._,
      features: _.features.map(extractData(variant)),
    })),
    // Effect.map((result) => result.features),
    // Effect.map(A.map(extractData)),
    // Effect.flatMap(S.parseEither(S.array(Branch)))
  );
}



export function getNearestCompetitors(
  latlng: { lat: number; lng: number },
  variant: Variant,
) {
  return pipe(
    Effect.flatMap(BranchRepository, (repo) =>
      repo.findNearestToCompetitors(latlng, variant),
    ),
    Effect.map((data) => 
      extractCompetitors("FCMB")(data) 
    ),
    Effect.map((_) => ({
      ..._,
      features: _.features.map(extractData(variant)),
    })),
  );
}
