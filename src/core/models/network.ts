import * as S from "zod";
import { CoverageSignal } from "./coverage";

export const Network = S.object({
  id: S.number(),
  title: S.string(),
  mapName: S.string(),
  priority: S.number(),
  tableName: S.string(),
  description: S.string(),
  coverageSignals: S.array(CoverageSignal),
});

export type Network = S.infer<typeof Network>;
