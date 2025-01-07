import * as Http from "http-kit";
import * as Res from "http-kit/response";

import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";

import { DataLayer } from "../../models/data-layer";
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
//         "id": 193,
//         "bank": "FIRST BANK",
//         "data": [   
//           {       
//           "branches": {

//             "id": 102,
//             "title": "FIRST BANK Branches",
//             "tableName": "path",
//             "mapName": "path",
//             "priority": 5,
//             "legend": [],
//             "attributes": [
//               {
//                 "value": "Region",
//                 "label": null,
//                 "category": "DESCRIPTION",
//                 "type": "STRING",
//                 "alias": null,
//                 "formula": "concat(\"Region\")"
//             },
//             {
//                 "value": "Branch_nam",
//                 "label": null,
//                 "category": "DESCRIPTION",
//                 "type": "STRING",
//                 "alias": null,
//                 "formula": "concat(\"Branch_nam\")"
//             },
//             {
//                 "value": "State",
//                 "label": null,
//                 "category": "DESCRIPTION",
//                 "type": "STRING",
//                 "alias": null,
//                 "formula": "concat(\"State\")"
//             },          
//             {
//                 "value": "Count",
//                 "label": null,
//                 "category": "DESCRIPTION",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "count(\"Branch_nam\")"
//             }
//             ],

//           },

//           "POS": {

//             "id": 102,
//             "title": "FIRST BANK Branches",
//             "tableName": "path",
//             "mapName": "path",
//             "priority": 5,
//             "legend": [],
//             "attributes": [
//               {
//                 "value": "Region",
//                 "label": null,
//                 "category": "DESCRIPTION",
//                 "type": "STRING",
//                 "alias": null,
//                 "formula": "concat(\"Region\")"
//             },
//             {
//                 "value": "Branch_nam",
//                 "label": null,
//                 "category": "DESCRIPTION",
//                 "type": "STRING",
//                 "alias": null,
//                 "formula": "concat(\"Branch_nam\")"
//             },
//             {
//                 "value": "State",
//                 "label": null,
//                 "category": "DESCRIPTION",
//                 "type": "STRING",
//                 "alias": null,
//                 "formula": "concat(\"State\")"
//             },          
//             {
//                 "value": "Count",
//                 "label": null,
//                 "category": "DESCRIPTION",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "count(\"Branch_nam\")"
//             }
//             ],

//           },

//           "ATM": {

//             "id": 102,
//             "title": "FIRST BANK Branches",
//             "tableName": "path",
//             "mapName": "path",
//             "priority": 5,
//             "legend": [],
//             "attributes": [
//               {
//                 "value": "Region",
//                 "label": null,
//                 "category": "DESCRIPTION",
//                 "type": "STRING",
//                 "alias": null,
//                 "formula": "concat(\"Region\")"
//             },
//             {
//                 "value": "Branch_nam",
//                 "label": null,
//                 "category": "DESCRIPTION",
//                 "type": "STRING",
//                 "alias": null,
//                 "formula": "concat(\"Branch_nam\")"
//             },
//             {
//                 "value": "State",
//                 "label": null,
//                 "category": "DESCRIPTION",
//                 "type": "STRING",
//                 "alias": null,
//                 "formula": "concat(\"State\")"
//             },          
//             {
//                 "value": "Count",
//                 "label": null,
//                 "category": "DESCRIPTION",
//                 "type": "NUMBER",
//                 "alias": null,
//                 "formula": "count(\"Branch_nam\")"
//             }
//             ],



//           },


//        } ]
//       },



//       // {
//       //     "id": 105,
//       //     "title": "Stanbic POS Agents",
//       //     "description": "Ward Nigeria Pop Stanbic",
//       //     "tableName": "STANBIC/NamedMaps/stabic_Stanbic_POS_ready_agents",
//       //     "mapName": "STANBIC/NamedMaps/stabic_Stanbic_POS_ready_agents Map",
//       //     "priority": 5,
//       //     "legend": [],
//       //     "attributes": [
//       //         {
//       //             "value": "Distance",
//       //             "label": null,
//       //             "category": "DESCRIPTION",
//       //             "type": "NUMBER",
//       //             "alias": null,
//       //             "formula": "sum(\"Distance\")"
//       //         },             
//       //         {
//       //             "value": "Agent_name",
//       //             "label": null,
//       //             "category": "DESCRIPTION",
//       //             "type": "STRING",
//       //             "alias": null,
//       //             "formula": "concat(\"Agent_name\")"
//       //         },
//       //         {
//       //             "value": "State",
//       //             "label": null,
//       //             "category": "DESCRIPTION",
//       //             "type": "STRING",
//       //             "alias": null,
//       //             "formula": "concat(\"State\")"
//       //         },
            
//       //         {
//       //             "value": "Count",
//       //             "label": null,
//       //             "category": "DESCRIPTION",
//       //             "type": "NUMBER",
//       //             "alias": null,
//       //             "formula": "count(\"Agent_name\")"
//       //         }
//       //     ]
//       // },
//       // {
//       //     "id": 104,
//       //     "title": "Population Data (Analytics)",
//       //     "description": "Ward Nigeria Pop Stanbic",
//       //     "tableName": "STANBIC/NamedMaps/stabic_Stanbic_Ward Nigeria Pop Stanbic",
//       //     "mapName": "STANBIC/NamedMaps/stabic_Stanbic_Ward Nigeria Pop Stanbic Map",
//       //     "priority": 5,
//       //     "legend": [],
//       //     "attributes": [
//       //       {
//       //           "value": "Pop1_4",
//       //           "label": null,
//       //           "category": "STATISTICS",
//       //           "type": "NUMBER",
//       //           "alias": null,
//       //           "formula": "sum(\"Pop1_4\")"
//       //       },
//       //       {
//       //           "value": "Pop5_9",
//       //           "label": null,
//       //           "category": "STATISTICS",
//       //           "type": "NUMBER",
//       //           "alias": null,
//       //           "formula": "sum(\"Pop5_9\")"
//       //       },
//       //       {
//       //           "value": "Pop10_14",
//       //           "label": null,
//       //           "category": "STATISTICS",
//       //           "type": "NUMBER",
//       //           "alias": null,
//       //           "formula": "sum(\"Pop10_14\")"
//       //       },
//       //       {
//       //           "value": "Pop15_19",
//       //           "label": null,
//       //           "category": "STATISTICS",
//       //           "type": "NUMBER",
//       //           "alias": null,
//       //           "formula": "sum(\"Pop15_19\")"
//       //       },
//       //       {
//       //           "value": "Pop20_24",
//       //           "label": null,
//       //           "category": "STATISTICS",
//       //           "type": "NUMBER",
//       //           "alias": null,
//       //           "formula": "sum(\"Pop20_24\")"
//       //       },
//       //       {
//       //           "value": "Pop25_29",
//       //           "label": null,
//       //           "category": "STATISTICS",
//       //           "type": "NUMBER",
//       //           "alias": null,
//       //           "formula": "sum(\"Pop25_29\")"
//       //       },
//       //       {
//       //           "value": "Pop30_34",
//       //           "label": null,
//       //           "category": "STATISTICS",
//       //           "type": "NUMBER",
//       //           "alias": null,
//       //           "formula": "sum(\"Pop30_34\")"
//       //       },
//       //       {
//       //           "value": "Pop35_39",
//       //           "label": null,
//       //           "category": "STATISTICS",
//       //           "type": "NUMBER",
//       //           "alias": null,
//       //           "formula": "sum(\"Pop35_39\")"
//       //       },
//       //       {
//       //           "value": "Pop40_44",
//       //           "label": null,
//       //           "category": "STATISTICS",
//       //           "type": "NUMBER",
//       //           "alias": null,
//       //           "formula": "sum(\"Pop40_44\")"
//       //       },
//       //       {
//       //           "value": "Pop45_49",
//       //           "label": null,
//       //           "category": "STATISTICS",
//       //           "type": "NUMBER",
//       //           "alias": null,
//       //           "formula": "sum(\"Pop45_49\")"
//       //       },
//       //       {
//       //           "value": "Pop50_54",
//       //           "label": null,
//       //           "category": "STATISTICS",
//       //           "type": "NUMBER",
//       //           "alias": null,
//       //           "formula": "sum(\"Pop50_54\")"
//       //       },
//       //       {
//       //           "value": "Pop55_59",
//       //           "label": null,
//       //           "category": "STATISTICS",
//       //           "type": "NUMBER",
//       //           "alias": null,
//       //           "formula": "sum(\"Pop55_59\")"
//       //       },
//       //       {
//       //           "value": "Pop60_64",
//       //           "label": null,
//       //           "category": "STATISTICS",
//       //           "type": "NUMBER",
//       //           "alias": null,
//       //           "formula": "sum(\"Pop60_64\")"
//       //       },
//       //       {
//       //           "value": "Pop70_74",
//       //           "label": null,
//       //           "category": "STATISTICS",
//       //           "type": "NUMBER",
//       //           "alias": null,
//       //           "formula": "sum(\"Pop70_74\")"
//       //       },
//       //       {
//       //           "value": "Pop75_100",
//       //           "label": null,
//       //           "category": "STATISTICS",
//       //           "type": "NUMBER",
//       //           "alias": null,
//       //           "formula": "sum(\"Pop75_100\")"
//       //       },
//       //       {
//       //           "value": "Pop_total",
//       //           "label": null,
//       //           "category": "STATISTICS",
//       //           "type": "NUMBER",
//       //           "alias": null,
//       //           "formula": "sum(\"Pop_total\")"
//       //       },
//       //         {
//       //             "value": "Distance",
//       //             "label": null,
//       //             "category": "DESCRIPTION",
//       //             "type": "NUMBER",
//       //             "alias": null,
//       //             "formula": "sum(\"Distance\")"
//       //         },
//       //         {
//       //             "value": "Bankbranch",
//       //             "label": null,
//       //             "category": "DESCRIPTION",
//       //             "type": "NUMBER",
//       //             "alias": null,
//       //             "formula": "sum(\"Bankbranch\")"
//       //         },
//       //         {
//       //             "value": "Pos_agents",
//       //             "label": null,
//       //             "category": "DESCRIPTION",
//       //             "type": "NUMBER",
//       //             "alias": null,
//       //             "formula": "sum(\"Pos_agents\")"
//       //         },
//       //         {
//       //             "value": "State_name",
//       //             "label": null,
//       //             "category": "DESCRIPTION",
//       //             "type": "STRING",
//       //             "alias": null,
//       //             "formula": "concat(\"State_name\")"
//       //         },            
//       //         {
//       //             "value": "Count",
//       //             "label": null,
//       //             "category": "DESCRIPTION",
//       //             "type": "NUMBER",
//       //             "alias": null,
//       //             "formula": "count(\"Ward_name\")"
//       //         }
//       //     ]
//       // },
//       // {
//       //     "id": 108,
//       //     "title": "Stanbic Branches",
//       //     "description": "Ward Nigeria Pop Stanbic",
//       //     "tableName": "STANBIC/NamedMaps/stabic_Stanbic_Stanbic_BANK_ADDRESS",
//       //     "mapName": "STANBIC/NamedMaps/stabic_Stanbic_Stanbic_BANK_ADDRESS Map",
//       //     "priority": 5,
//       //     "legend": [],
//       //     "attributes": [
//       //         {
//       //             "value": "Region",
//       //             "label": null,
//       //             "category": "DESCRIPTION",
//       //             "type": "STRING",
//       //             "alias": null,
//       //             "formula": "concat(\"Region\")"
//       //         },
//       //         {
//       //             "value": "Branch_nam",
//       //             "label": null,
//       //             "category": "DESCRIPTION",
//       //             "type": "STRING",
//       //             "alias": null,
//       //             "formula": "concat(\"Branch_nam\")"
//       //         },
//       //         {
//       //             "value": "State",
//       //             "label": null,
//       //             "category": "DESCRIPTION",
//       //             "type": "STRING",
//       //             "alias": null,
//       //             "formula": "concat(\"State\")"
//       //         },          
//       //         {
//       //             "value": "Count",
//       //             "label": null,
//       //             "category": "DESCRIPTION",
//       //             "type": "NUMBER",
//       //             "alias": null,
//       //             "formula": "count(\"Branch_nam\")"
//       //         }
//       //     ]
//       // }
//   ]
// }


const staticAreaMapData: DataLayer[]  = [

{
  "id": 2020,
  "title": "Population Cluster",
  "description": "Area Map",
  "tableName": "/CHANNELS/MAPDATA/Cluster_Population_2023",
  "mapName": "/CHANNELS/MAPDATA/Cluster_Population_2023 Map",
  "priority": 1,
  "legend": [
    {
        "value": "51,000 - 691,000",
        "color": "#0000FF"
    },
    {
        "value": "29,000 - 51,000",
        "color": "#3040FF"
    },
    {
        "value": "17,000 - 29,000",
        "color": "#7080FF"
    },
    {
        "value": "9,000 - 17,000",
        "color": "#A0C0FF"
    },
    {
        "value": "0 - 9,000",
        "color": "#D0FFFF"
    }
],
  "attributes": [
      {
          "value": "CLUSTER",
          "label": null,
          "category": "DESCRIPTION",
          "type": "STRING",
          // @ts-expect-error
          "alias": null,
          "formula": "concat(\"CLUSTER\")"
      },

      {
        "value": "LOCAL_GOVERNMENT",
        "label": null,
        "category": "DESCRIPTION",
        "type": "STRING",
        // @ts-expect-error
        "alias": null,
        "formula": "concat(\"LOCAL_GOVERNMENT\")"
      },

      {
        "value": "STATE",
        "label": null,
        "category": "DESCRIPTION",
        "type": "STRING",
        // @ts-expect-error
        "alias": null,
        "formula": "concat(\"STATE\")"
      },

      {
        "value": "POPULATION",
        "label": null,
        "category": "STATISTICS",
        // @ts-expect-error
        "type": "NUMBER",
        // @ts-expect-error
        "alias": null,
        "formula": "sum(\"POPULATION\")"
      },

      {
        "value": "POPULATION_DENSITY",
        "label": null,
        "category": "STATISTICS",
        // @ts-expect-error
        "type": "NUMBER",
        // @ts-expect-error
        "alias": null,
        "formula": "sum(\"POPULATION_DENSITY\")"
      },

      {
        "value": "Male_Population",
        "label": null,
        "category": "STATISTICS",
        // @ts-expect-error
        "type": "NUMBER",
        // @ts-expect-error
        "alias": null,
        "formula": "sum(\"Male_Population\")"
      },

      {
        "value": "Female_Population",
        "label": null,
        "category": "STATISTICS",
        // @ts-expect-error
        "type": "NUMBER",
        // @ts-expect-error
        "alias": null,
        "formula": "sum(\"Female_Population\")"
      },

      {
        "value": "Age_0_19",
        "label": null,
        "category": "STATISTICS",
        // @ts-expect-error
        "type": "NUMBER",
        // @ts-expect-error
        "alias": null,
        "formula": "sum(\"Age_0_19\")"
      },

      {
        "value": "Age_20_39",
        "label": null,
        "category": "STATISTICS",
        // @ts-expect-error
        "type": "NUMBER",
        // @ts-expect-error
        "alias": null,
        "formula": "sum(\"Age_20_39\")"
      },

      {
        "value": "Age_40_59",
        "label": null,
        "category": "STATISTICS",
        // @ts-expect-error
        "type": "NUMBER",
        // @ts-expect-error
        "alias": null,
        "formula": "sum(\"Age_40_59\")"
      },

      {
        "value": "Age_60_and_above",
        "label": null,
        "category": "STATISTICS",
        // @ts-expect-error
        "type": "NUMBER",
        // @ts-expect-error
        "alias": null,
        "formula": "sum(\"Age_60_and_above\")"
      },

      {
        "value": "AREA_SQKM",
        "label": null,
        "category": "STATISTICS",
        "type": "STRING",
        // @ts-expect-error
        "alias": null,
        "formula": "sum(\"AREA_SQKM\")"
      },
      {
        "value": "Count",
        "label": null,
        "category": "STATISTICS",
        // @ts-expect-error
        "type": "NUMBER",
        // @ts-expect-error
        "alias": null,
        "formula": "count(\"STATE\")"
      }

  ]
},

{
  "id": 20200,
  "title": "Income Level",
  "description": "Income Level",
  "tableName": "/CHANNELS/MAPDATA/Income Level",
  "mapName": "/CHANNELS/MAPDATA/Income_Level Map",
  "priority": 1,
  "legend": [
    {
      "value": "Very High Income",
      "color": "#f40000"
  },
  {
      "value": "High Income",
      "color": "#F8B169"
  },
  {
      "value": "Medium Income",
      "color": "#4546FA"
  },
  {
      "value": "Low Income",
      "color": "#87F6EE"
  },
  {
      "value": "Poor Income",
      "color": "#DDDCDA"
  }
  ],
  "attributes": [
      {
          "value": "Area_Name",
          "label": null,
          "category": "DESCRIPTION",
          "type": "STRING",
          // @ts-expect-error
          "alias": null,
          "formula": "concat(\"Area_Name\")"
      },

      {
        "value": "LGA",
        "label": null,
        "category": "DESCRIPTION",
        "type": "STRING",
        // @ts-expect-error
        "alias": null,
        "formula": "concat(\"LGA\")"
      },

      {
        "value": "State",
        "label": null,
        "category": "DESCRIPTION",
        "type": "STRING",
        // @ts-expect-error
        "alias": null,
        "formula": "concat(\"State\")"
      },

      {
        "value": "Income_Level",
        "label": null,
        "category": "DESCRIPTION",
        "type": "STRING",
        // @ts-expect-error
        "alias": null,
        "formula": "concat(\"Income_Level\")"
      },

      {
        "value": "Count",
        "label": null,
        // @ts-expect-error
        "category": "STATISTIC",
        // @ts-expect-error
        "type": "NUMBER",
        // @ts-expect-error
        "alias": null,
        "formula": "count(\"Area_Name\")"
      }

  ]
},

]

// const dataLayerStatic: APIRes<DataLayer[]> = {
//   data: [
//     {
//       id: 193,
//       bank: "FIRST BANK",
//       data: [
        
//           {
//             id: 102,
//             title: "First bank Branches",
//             tableName: "path",
//             mapName: "path",
//             priority: 5,
//             legend: [],
//             attributes: [
//               {
//                 value: "Region",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Region")',
//               },
//               {
//                 value: "Branch_nam",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Branch_nam")',
//               },
//               {
//                 value: "State",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("State")',
//               },
//               {
//                 value: "Count",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "NUMBER",
//                 alias: null,
//                 formula: 'count("Branch_nam")',
//               },
//             ],
//           },

//       {
//             id: 103,
//             title: "First bank POS",
//             tableName: "path",
//             mapName: "path",
//             priority: 5,
//             legend: [],
//             attributes: [
//               {
//                 value: "Region",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Region")',
//               },
//               {
//                 value: "Branch_nam",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Branch_nam")',
//               },
//               {
//                 value: "State",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("State")',
//               },
//               {
//                 value: "Count",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "NUMBER",
//                 alias: null,
//                 formula: 'count("Branch_nam")',
//               },
//             ],
//           },

//           {
//             id: 104,
//             title: "First bank ATM",
//             tableName: "path",
//             mapName: "path",
//             priority: 5,
//             legend: [],
//             attributes: [
//               {
//                 value: "Region",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Region")',
//               },
//               {
//                 value: "Branch_nam",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Branch_nam")',
//               },
//               {
//                 value: "State",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("State")',
//               },
//               {
//                 value: "Count",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "NUMBER",
//                 alias: null,
//                 formula: 'count("Branch_nam")',
//               },
//             ],
//           },
        
//       ],
//     },

//     {

//       id: 194,
//       bank: "UNION BANK",
//       data: [   
//          {
//             id: 106,
//             title: "Union bank Branches",
//             tableName: "path",
//             mapName: "path",
//             priority: 5,
//             legend: [],
//             attributes: [
//               {
//                 value: "Region",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Region")',
//               },
//               {
//                 value: "Branch_nam",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Branch_nam")',
//               },
//               {
//                 value: "State",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("State")',
//               },
//               {
//                 value: "Count",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "NUMBER",
//                 alias: null,
//                 formula: 'count("Branch_nam")',
//               },
//             ],
//           },

//          {
//             id: 107,
//             title: "Union bank POS",
//             tableName: "path",
//             mapName: "path",
//             priority: 5,
//             legend: [],
//             attributes: [
//               {
//                 value: "Region",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Region")',
//               },
//               {
//                 value: "Branch_nam",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Branch_nam")',
//               },
//               {
//                 value: "State",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("State")',
//               },
//               {
//                 value: "Count",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "NUMBER",
//                 alias: null,
//                 formula: 'count("Branch_nam")',
//               },
//             ],
//           },

//          {
//             id: 108,
//             title: "Union bank ATM",
//             tableName: "path",
//             mapName: "path",
//             priority: 5,
//             legend: [],
//             attributes: [
//               {
//                 value: "Region",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Region")',
//               },
//               {
//                 value: "Branch_nam",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Branch_nam")',
//               },
//               {
//                 value: "State",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("State")',
//               },
//               {
//                 value: "Count",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "NUMBER",
//                 alias: null,
//                 formula: 'count("Branch_nam")',
//               },
//             ],
//           },
      
//       ],

//     },

//     {
//       id: 195,
//       bank: "FIDELITY BANK",
//       data: [
   
//          {
//             id: 111,
//             title: "Fidelity Branches",
//             tableName: "path",
//             mapName: "path",
//             priority: 5,
//             legend: [],
//             attributes: [
//               {
//                 value: "Region",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Region")',
//               },
//               {
//                 value: "Branch_nam",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Branch_nam")',
//               },
//               {
//                 value: "State",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("State")',
//               },
//               {
//                 value: "Count",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "NUMBER",
//                 alias: null,
//                 formula: 'count("Branch_nam")',
//               },
//             ],
//           },

//          {
//             id: 109,
//             title: "Fidelity POS",
//             tableName: "path",
//             mapName: "path",
//             priority: 5,
//             legend: [],
//             attributes: [
//               {
//                 value: "Region",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Region")',
//               },
//               {
//                 value: "Branch_nam",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Branch_nam")',
//               },
//               {
//                 value: "State",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("State")',
//               },
//               {
//                 value: "Count",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "NUMBER",
//                 alias: null,
//                 formula: 'count("Branch_nam")',
//               },
//             ],
//           },

//        {
//             id: 110,
//             title: "Fidelity  ATM",
//             tableName: "path",
//             mapName: "path",
//             priority: 5,
//             legend: [],
//             attributes: [
//               {
//                 value: "Region",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Region")',
//               },
//               {
//                 value: "Branch_nam",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("Branch_nam")',
//               },
//               {
//                 value: "State",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "STRING",
//                 alias: null,
//                 formula: 'concat("State")',
//               },
//               {
//                 value: "Count",
//                 label: null,
//                 category: "DESCRIPTION",
//                 type: "NUMBER",
//                 alias: null,
//                 formula: 'count("Branch_nam")',
//               },
//             ],
//           },
    
//       ],

//     }

//   ],
// };

    return {
      // getAll() {
      //   return pipe(
      //     Http.get("/map-layer/my"),
      //     Res.filterStatusOk(),
      //     Res.toJson<APIRes<DataLayer[]>>(),
      //     http.make
      //   );
      //   // return Effect.succeed(dataLayerStatic);
      // },

      getAll() {
        return pipe(
          Http.get("/map-layer/my"),
          Res.filterStatusOk(),
          Res.toJson<DataLayer[]>(),
          http.make
        );
      },

      getAreaMap(){
        return Effect.succeed(staticAreaMapData)
      },

      // getAll() {
      //   return pipe(
      //     Http.get("/home/map-layers"),
      //     Res.filterStatusOk(),
      //     Res.toJson<APIRes<DataLayer[]>>(),
      //     http.make
      //   );
      // },

      // getAllCompetitors() {
      //     return  Effect.succeed(dataLayerStatic)
      // },

      getAllCompetitors () {
        return pipe(
          Http.get("/map-layer/competitors"),
          Res.filterStatusOk(),
          Res.toJson<DataLayer[]>(),
          http.make
        )
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
