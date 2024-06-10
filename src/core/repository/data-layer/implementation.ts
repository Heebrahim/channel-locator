import * as Http from "http-kit";
import * as Res from "http-kit/response";

import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";

import { DataLayer } from "../../models/data-layer";
import { APIRes } from "../../types/api";
import { DataLayerRepository } from "./contract";

import { FeatureService } from "@/core/tags/spectrum";
import { FeatureCollection, Geometry } from "geojson";
import { HttpClient } from "@/common/http-client";
import { filterSpectrumResult } from "../utils";
import { SpectrumError } from "@/core/exceptions/spectrum";

export const DataLayerRepositoryLive = Layer.effect(
  DataLayerRepository,
  Effect.gen(function* (_) {
    const service = yield* _(FeatureService);
   const http = yield* _(HttpClient);

//     const dataLayerStatic: APIRes<DataLayer[]> =  {data:[
//       {
//           "id": 105,
//           "title": "Stanbic POS Agents",
//           "description": "Ward Nigeria Pop Stanbic",
//           "tableName": "STANBIC/NamedMaps/stabic_Stanbic_POS_ready_agents",
//           "mapName": "STANBIC/NamedMaps/stabic_Stanbic_POS_ready_agents Map",
//           "priority": 5,
//           "legend": [],
//           "attributes": [
//               {
//                   "value": "Distance",
//                   "label": null,
//                   "category": "DESCRIPTION",
//                   "type": "NUMBER",
//                   "alias": null,
//                   "formula": "sum(\"Distance\")"
//               },             
//               {
//                   "value": "Agent_name",
//                   "label": null,
//                   "category": "DESCRIPTION",
//                   "type": "STRING",
//                   "alias": null,
//                   "formula": "concat(\"Agent_name\")"
//               },
//               {
//                   "value": "State",
//                   "label": null,
//                   "category": "DESCRIPTION",
//                   "type": "STRING",
//                   "alias": null,
//                   "formula": "concat(\"State\")"
//               },
            
//               {
//                   "value": "Count",
//                   "label": null,
//                   "category": "DESCRIPTION",
//                   "type": "NUMBER",
//                   "alias": null,
//                   "formula": "count(\"Agent_name\")"
//               }
//           ]
//       },
//       {
//           "id": 104,
//           "title": "Population Data (Analytics)",
//           "description": "Ward Nigeria Pop Stanbic",
//           "tableName": "STANBIC/NamedMaps/stabic_Stanbic_Ward Nigeria Pop Stanbic",
//           "mapName": "STANBIC/NamedMaps/stabic_Stanbic_Ward Nigeria Pop Stanbic Map",
//           "priority": 5,
//           "legend": [],
//           "attributes": [
//             {
//                 "value": "Pop1_4",
//                 "label": null,
//                 "category": "STATISTICS",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "sum(\"Pop1_4\")"
//             },
//             {
//                 "value": "Pop5_9",
//                 "label": null,
//                 "category": "STATISTICS",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "sum(\"Pop5_9\")"
//             },
//             {
//                 "value": "Pop10_14",
//                 "label": null,
//                 "category": "STATISTICS",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "sum(\"Pop10_14\")"
//             },
//             {
//                 "value": "Pop15_19",
//                 "label": null,
//                 "category": "STATISTICS",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "sum(\"Pop15_19\")"
//             },
//             {
//                 "value": "Pop20_24",
//                 "label": null,
//                 "category": "STATISTICS",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "sum(\"Pop20_24\")"
//             },
//             {
//                 "value": "Pop25_29",
//                 "label": null,
//                 "category": "STATISTICS",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "sum(\"Pop25_29\")"
//             },
//             {
//                 "value": "Pop30_34",
//                 "label": null,
//                 "category": "STATISTICS",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "sum(\"Pop30_34\")"
//             },
//             {
//                 "value": "Pop35_39",
//                 "label": null,
//                 "category": "STATISTICS",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "sum(\"Pop35_39\")"
//             },
//             {
//                 "value": "Pop40_44",
//                 "label": null,
//                 "category": "STATISTICS",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "sum(\"Pop40_44\")"
//             },
//             {
//                 "value": "Pop45_49",
//                 "label": null,
//                 "category": "STATISTICS",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "sum(\"Pop45_49\")"
//             },
//             {
//                 "value": "Pop50_54",
//                 "label": null,
//                 "category": "STATISTICS",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "sum(\"Pop50_54\")"
//             },
//             {
//                 "value": "Pop55_59",
//                 "label": null,
//                 "category": "STATISTICS",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "sum(\"Pop55_59\")"
//             },
//             {
//                 "value": "Pop60_64",
//                 "label": null,
//                 "category": "STATISTICS",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "sum(\"Pop60_64\")"
//             },
//             {
//                 "value": "Pop70_74",
//                 "label": null,
//                 "category": "STATISTICS",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "sum(\"Pop70_74\")"
//             },
//             {
//                 "value": "Pop75_100",
//                 "label": null,
//                 "category": "STATISTICS",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "sum(\"Pop75_100\")"
//             },
//             {
//                 "value": "Pop_total",
//                 "label": null,
//                 "category": "STATISTICS",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "sum(\"Pop_total\")"
//             },
//               {
//                   "value": "Distance",
//                   "label": null,
//                   "category": "DESCRIPTION",
//                   "type": "NUMBER",
//                   "alias": null,
//                   "formula": "sum(\"Distance\")"
//               },
//               {
//                   "value": "Bankbranch",
//                   "label": null,
//                   "category": "DESCRIPTION",
//                   "type": "NUMBER",
//                   "alias": null,
//                   "formula": "sum(\"Bankbranch\")"
//               },
//               {
//                   "value": "Pos_agents",
//                   "label": null,
//                   "category": "DESCRIPTION",
//                   "type": "NUMBER",
//                   "alias": null,
//                   "formula": "sum(\"Pos_agents\")"
//               },
//               {
//                   "value": "State_name",
//                   "label": null,
//                   "category": "DESCRIPTION",
//                   "type": "STRING",
//                   "alias": null,
//                   "formula": "concat(\"State_name\")"
//               },            
//               {
//                   "value": "Count",
//                   "label": null,
//                   "category": "DESCRIPTION",
//                   "type": "NUMBER",
//                   "alias": null,
//                   "formula": "count(\"Ward_name\")"
//               }
//           ]
//       },
//       {
//           "id": 108,
//           "title": "Stanbic Branches",
//           "description": "Ward Nigeria Pop Stanbic",
//           "tableName": "STANBIC/NamedMaps/stabic_Stanbic_Stanbic_BANK_ADDRESS",
//           "mapName": "STANBIC/NamedMaps/stabic_Stanbic_Stanbic_BANK_ADDRESS Map",
//           "priority": 5,
//           "legend": [],
//           "attributes": [
//               {
//                   "value": "Region",
//                   "label": null,
//                   "category": "DESCRIPTION",
//                   "type": "STRING",
//                   "alias": null,
//                   "formula": "concat(\"Region\")"
//               },
//               {
//                   "value": "Branch_nam",
//                   "label": null,
//                   "category": "DESCRIPTION",
//                   "type": "STRING",
//                   "alias": null,
//                   "formula": "concat(\"Branch_nam\")"
//               },
//               {
//                   "value": "State",
//                   "label": null,
//                   "category": "DESCRIPTION",
//                   "type": "STRING",
//                   "alias": null,
//                   "formula": "concat(\"State\")"
//               },          
//               {
//                   "value": "Count",
//                   "label": null,
//                   "category": "DESCRIPTION",
//                   "type": "NUMBER",
//                   "alias": null,
//                   "formula": "count(\"Branch_nam\")"
//               }
//           ]
//       }
//   ]
// }
    return {
      getAll() {
        return pipe(
          Http.get("/home/map-layers"),
          Res.filterStatusOk(),
          Res.toJson<APIRes<DataLayer[]>>(),
          http.make
        );
        // return Effect.succeed(dataLayerStatic);
      },
      searchAt(layer, { lat: y, lng: x }, radius, options) {
        return pipe(
          Effect.tryPromise({
            catch: (e) => new SpectrumError(e),
            try: () =>
              service.searchAtPoint(layer.tableName, { x, y }, "EPSG:4326", {
                ...options,
                tolerance: `${radius} m`,
              }),
          }),
          Effect.flatMap((_) =>
            filterSpectrumResult<FeatureCollection<Geometry, any>>(_)
          )
        );
      },
      searchWithin(layer, geometry) {
        return pipe(
          Effect.tryPromise({
            catch: (e) => new SpectrumError(e),
            try: () =>
              service.searchNearest(layer.tableName, geometry, {
                maxFeatures: "1000",
                withinDistance: "0 mi",
              }),
          }),
          Effect.flatMap((_) => filterSpectrumResult(_))
        );
      },
    };
  })
);
