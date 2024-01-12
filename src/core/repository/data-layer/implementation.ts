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

    const dataLayerStatic: APIRes<DataLayer[]> =  {data:[
      {
          "id": 2,
          "title": "Socio-economic Data",
          "description": "Socio-economic Data",
          "tableName": "COVERAGES/NamedMaps/SEDI_Nigeria",
          "mapName": "COVERAGES/NamedMaps/SEDI_Nigeria Map",
          "priority": 1,
          "legend": [
              {
                  "value": "Very High Income",
                  "color": "#f40000"
              },
              {
                  "value": "High Income",
                  "color": "#e18080"
              },
              {
                  "value": "Medium Income",
                  "color": "#e1e100"
              },
              {
                  "value": "Low Income",
                  "color": "#a0e1e1"
              },
              {
                  "value": "Poor Income",
                  "color": "#70a0e1"
              }
          ],
          "attributes": [
              {
                  "value": "Population_within_SEDI_1",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Population_within_SEDI_1\")"
              },
              {
                  "value": "Population_within_SEDI_2",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Population_within_SEDI_2\")"
              },
              {
                  "value": "Population_within_SEDI_3",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Population_within_SEDI_3\")"
              },
              {
                  "value": "Population_within_SEDI_4",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Population_within_SEDI_4\")"
              },
              {
                  "value": "Population_within_SEDI_5",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Population_within_SEDI_5\")"
              },
              {
                  "value": "Population_within_SEDI_6",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Population_within_SEDI_6\")"
              },
              {
                  "value": "Population_within_SEDI_7",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Population_within_SEDI_7\")"
              },
              {
                  "value": "Population_within_SEDI_8",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Population_within_SEDI_8\")"
              },
              {
                  "value": "Population_within_SEDI_9",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Population_within_SEDI_9\")"
              },
              {
                  "value": "Population_within_SEDI_10",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Population_within_SEDI_10\")"
              },
              {
                  "value": "SEDI_CATEGORY",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "STRING",
                  "alias": null,
                  "formula": "concat(\"SEDI_CATEGORY\")"
              },
              {
                  "value": "STATE",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "STRING",
                  "alias": null,
                  "formula": "concat(\"STATE\")"
              },
              {
                  "value": "Count",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "count(\"STATE\")"
              }
          ]
      },
      {
          "id": 52,
          "title": "Population Data",
          "description": "Population Data",
          "tableName": "COVERAGES/NamedMaps/Pop_and_Landuse_merged",
          "mapName": "COVERAGES/NamedMaps/Pop_and_Landuse_merged Map",
          "priority": 1,
          "legend": [
              {
                  "value": "1,580 - 1,610",
                  "color": "#fe0000"
              },
              {
                  "value": "720 - 1,580",
                  "color": "#ff591f"
              },
              {
                  "value": "330 - 720",
                  "color": "#ffff00"
              },
              {
                  "value": "110 - 330",
                  "color": "#b0ffd7"
              },
              {
                  "value": "0 - 110",
                  "color": "#0080c0"
              }
          ],
          "attributes": [
              {
                  "value": "COMMERCIAL_BUILDINGS",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"COMMERCIAL_BUILDINGS\")"
              },
              {
                  "value": "EDUCATIONAL_BUILDINGS",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"EDUCATIONAL_BUILDINGS\")"
              },
              {
                  "value": "EDUCATIONAL_FACILITIES",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"EDUCATIONAL_FACILITIES\")"
              },
              {
                  "value": "FORMAL_RESIDENTIAL_BUILDINGS",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"FORMAL_RESIDENTIAL_BUILDINGS\")"
              },
              {
                  "value": "HEALTHCARE_BUILDINGS",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"HEALTHCARE_BUILDINGS\")"
              },
              {
                  "value": "HEALTHCARE_FACILITIES",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"HEALTHCARE_FACILITIES\")"
              },
              {
                  "value": "INDUSTRIAL_BUILDINGS",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"INDUSTRIAL_BUILDINGS\")"
              },
              {
                  "value": "LOCAL_GOVERNMENT",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "STRING",
                  "alias": null,
                  "formula": "sum(\"LOCAL_GOVERNMENT\")"
              },
              {
                  "value": "MOBILE_USAGE_INDEX",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "max(\"MOBILE_USAGE_INDEX\")"
              },
              {
                  "value": "NAME",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "STRING",
                  "alias": null,
                  "formula": "concat(\"NAME\")"
              },
              {
                  "value": "POPULATION",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"POPULATION\")"
              },
              {
                  "value": "STATE",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "STRING",
                  "alias": null,
                  "formula": "concat(\"STATE\")"
              },
              {
                  "value": "Count",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "count(\"STATE\")"
              }
          ]
      },
      {
          "id": 105,
          "title": "Stanbic POS Data",
          "description": "Ward Nigeria Pop Stanbic",
          "tableName": "STANBIC/NamedMaps/stabic_Stanbic_POS_ready_agents",
          "mapName": "STANBIC/NamedMaps/stabic_Stanbic_POS_ready_agents Map",
          "priority": 5,
          "legend": [],
          "attributes": [
              {
                  "value": "Distance",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Distance\")"
              },
              {
                  "value": "Gps_cord",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Gps_cord\")"
              },
              {
                  "value": "Latitutde",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Latitutde\")"
              },
              {
                  "value": "Longitutde",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Longitutde\")"
              },
              {
                  "value": "Msisdn",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": ""
              },
              {
                  "value": "Name",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "STRING",
                  "alias": null,
                  "formula": "concat(\"Name\")"
              },
              {
                  "value": "Timestamp",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "concat(\"Timestamp\")"
              },
              {
                  "value": "Count",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "count(\"Name\")"
              }
          ]
      },
      {
          "id": 104,
          "title": "Stanbic Customers Data",
          "description": "Ward Nigeria Pop Stanbic",
          "tableName": "STANBIC/NamedMaps/stabic_Stanbic_Ward Nigeria Pop Stanbic",
          "mapName": "STANBIC/NamedMaps/stabic_Stanbic_Ward Nigeria Pop Stanbic Map",
          "priority": 5,
          "legend": [],
          "attributes": [
              {
                  "value": "Distance",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Distance\")"
              },
              {
                  "value": "Gps_cord",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Gps_cord\")"
              },
              {
                  "value": "Latitutde",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Latitutde\")"
              },
              {
                  "value": "Longitutde",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Longitutde\")"
              },
              {
                  "value": "Msisdn",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": ""
              },
              {
                  "value": "Name",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "STRING",
                  "alias": null,
                  "formula": "concat(\"Name\")"
              },
              {
                  "value": "Timestamp",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "concat(\"Timestamp\")"
              },
              {
                  "value": "Count",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "count(\"Name\")"
              }
          ]
      },
      {
          "id": 108,
          "title": "Stanbic Branches Data",
          "description": "Ward Nigeria Pop Stanbic",
          "tableName": "STANBIC/NamedMaps/stabic_Stanbic_Stanbic_BANK_ADDRESS",
          "mapName": "STANBIC/NamedMaps/stabic_Stanbic_Stanbic_BANK_ADDRESS Map",
          "priority": 5,
          "legend": [],
          "attributes": [
              {
                  "value": "Distance",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Distance\")"
              },
              {
                  "value": "Gps_cord",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Gps_cord\")"
              },
              {
                  "value": "Latitutde",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Latitutde\")"
              },
              {
                  "value": "Longitutde",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Longitutde\")"
              },
              {
                  "value": "Msisdn",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": ""
              },
              {
                  "value": "Name",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "STRING",
                  "alias": null,
                  "formula": "concat(\"Name\")"
              },
              {
                  "value": "Timestamp",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "concat(\"Timestamp\")"
              },
              {
                  "value": "Count",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "count(\"Name\")"
              }
          ]
      },
      {
          "id": 102,
          "title": "Population Density (Cluster)",
          "description": "Population Density (Cluster)",
          "tableName": "COVERAGES/NamedMaps/Cluster_Population_2023",
          "mapName": "COVERAGES/NamedMaps/Cluster_Population_2023 Map",
          "priority": 3,
          "legend": [
              {
                  "value": "20,600 - 44,500",
                  "color": "#fe403f"
              },
              {
                  "value": "10,400 - 20,600",
                  "color": "#fec17e"
              },
              {
                  "value": "4,800 - 10,400",
                  "color": "#fffece"
              },
              {
                  "value": "1,200 - 4,800",
                  "color": "#b1e1d7"
              },
              {
                  "value": "0 - 1,200",
                  "color": "#0180be"
              }
          ],
          "attributes": [
              {
                  "value": "STATE",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "STRING",
                  "alias": null,
                  "formula": "concat(\"STATE\")"
              },
              {
                  "value": "LOCAL_GOVERNMENT",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "STRING",
                  "alias": null,
                  "formula": "concat(\"LOCAL_GOVERNMENT\")"
              },
              {
                  "value": "CLUSTER",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "STRING",
                  "alias": null,
                  "formula": "concat(\"CLUSTER\")"
              },
              {
                  "value": "POPULATION",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"POPULATION\")"
              },
              {
                  "value": "Male_Population",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Male_Population\")"
              },
              {
                  "value": "Female_Population",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"Female_Population\")"
              },
              {
                  "value": "Age_0_19",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "count(\"Age_0_19\")"
              },
              {
                  "value": "Age_20_39",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "count(\"Age_20_39\")"
              },
              {
                  "value": "Age_40_59",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "count(\"Age_40_59\")"
              },
              {
                  "value": "Age_60_and_above",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "count(\"Age_60_and_above\")"
              },
              {
                  "value": "INFORMAL_RESIDENTIAL_BLD",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"INFORMAL_RESIDENTIAL_BLD\")"
              },
              {
                  "value": "SMALL_STRUCTURE_RESIDENTIAL_BLD",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"SMALL_STRUCTURE_RESIDENTIAL_BLD\")"
              },
              {
                  "value": "COMMERCIAL_BLD",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"COMMERCIAL_BLD\")"
              },
              {
                  "value": "INDUSTRIAL_BLD",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"INDUSTRIAL_BLD\")"
              },
              {
                  "value": "EDUCATIONAL_BLD",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"EDUCATIONAL_BLD\")"
              },
              {
                  "value": "HEALTH_BLD",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"HEALTH_BLD\")"
              },
              {
                  "value": "AGRICULTURE_BLD",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"AGRICULTURE_BLD\")"
              },
              {
                  "value": "OTHER_BLD",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"OTHER_BLD\")"
              },
              {
                  "value": "EDUCATIONAL_STRUCTURE",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "STRING",
                  "alias": null,
                  "formula": "sum(\"EDUCATIONAL_STRUCTURE\")"
              },
              {
                  "value": "HEALTH_STRUCTURE",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"HEALTH_STRUCTURE\")"
              },
              {
                  "value": "MOBILE_USAGE_INDEX",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "max(\"MOBILE_USAGE_INDEX\")"
              },
              {
                  "value": "AREA_SQKM",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"AREA_SQKM\")"
              },
              {
                  "value": "POPULATION_DENSITY",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"POPULATION_DENSITY\")"
              },
              {
                  "value": "FBB_DEVICES",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"FBB_DEVICES\")"
              },
              {
                  "value": "MARKET_PENETRATION_%",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "(sum(\"NUMBER_OF_DEVICES\")/sum(\"POPULATION\"))*100"
              },
              {
                  "value": "NUMBER_OF_DEVICES",
                  "label": null,
                  "category": "STATISTICS",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "sum(\"NUMBER_OF_DEVICES\")"
              },
              {
                  "value": "Count",
                  "label": null,
                  "category": "DESCRIPTION",
                  "type": "NUMBER",
                  "alias": null,
                  "formula": "count(\"STATE\")"
              }
          ]
      }
  ]
}
    return {
      getAll() {
        // return pipe(
        //   Http.get("/home/map-layers"),
        //   Res.filterStatusOk(),
        //   Res.toJson<APIRes<DataLayer[]>>(),
        //   http.make
        // );
        return Effect.succeed(dataLayerStatic);

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
