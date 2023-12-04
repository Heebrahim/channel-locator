import { Err } from "http-kit";

import * as Context from "@effect/data/Context";
import * as Effect from "@effect/io/Effect";

import { Network } from "@/core/models/network";
import { APIRes } from "@/core/types/api";
import { JsonParseError, StatusError } from "http-kit/response";

export interface NetworkRepository {
  getAll(): Effect.Effect<
    never,
    Err | StatusError | JsonParseError,
    APIRes<Array<Network>>
  >;
}

export const NetworkRepository = Context.Tag<NetworkRepository>();
