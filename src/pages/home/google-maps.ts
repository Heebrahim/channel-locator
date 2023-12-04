import { GoogleLayer } from "../../libs/maps/google";

// @ts-ignore
export const googleRoad = new GoogleLayer("ROADMAP");

// @ts-ignore
export const googleTerrian = new GoogleLayer("TERRAIN");

// @ts-ignore
export const googleSatellite = new GoogleLayer("SATELLITE");

// @ts-ignore
export const googleHybrid = new GoogleLayer("HYBRID");

export const baseMaps = {
  "Google Road Map": googleRoad,
  "Google Hybrid Map": googleHybrid,
  "Google Terrain Map": googleTerrian,
  "Google Satellite Map": googleSatellite,
};
