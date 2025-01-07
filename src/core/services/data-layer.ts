import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";

import { DataLayerRepository } from "../repository/data-layer/contract";
import { DataLayer } from "../models/data-layer";
import { SearchAtPointOptions } from "@/libs/spectrum/services/FeatureService";
import { LatLng } from "../types/misc";

export function getDataLayers() {
  return  pipe(
    Effect.flatMap(DataLayerRepository, (repo) => repo.getAll()),
    )
  }


export function getAreaMapDataLayers() {
  return  pipe(
    Effect.flatMap(DataLayerRepository, (repo) => repo.getAreaMap()),
    )
  }
export function getDataLayersForCompetitors() {
  return pipe(
    Effect.flatMap(DataLayerRepository, (repo) => repo.getAllCompetitors())
  );
}

export function findForLayerAt(
  layer: DataLayer,
  latlng: LatLng,
  radius: number,
  options?: SearchAtPointOptions
) {
  return Effect.flatMap(DataLayerRepository, (repo) =>
    repo.searchAt(layer, latlng, radius, options)
  );
}

export function findForLayerWithin(layer: DataLayer, geometry: any) {
  return Effect.flatMap(DataLayerRepository, (repo) =>
    repo.searchWithin(layer, geometry)
  );
}

export function findForLayersAt(
  layers: Array<DataLayer>,
  latlng: LatLng,
  radius: number
) {
  const effects = layers.map(
    (layer) => [layer.id, findForLayerAt(layer, latlng, radius)] as const
  );

  return Effect.all(Object.fromEntries(effects));
}

export function findForLayersWithin(layers: Array<DataLayer>, geometry: any) {
  const effects = layers.map(
    (layer) => [layer.id, findForLayerWithin(layer, geometry)] as const
  );

  return Effect.all(Object.fromEntries(effects));
}
