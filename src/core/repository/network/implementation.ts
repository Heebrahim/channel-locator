import * as Http from "http-kit";
import * as Res from "http-kit/response";

import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";

import { HttpClient } from "@/common/http-client";
import { Network } from "@/core/models/network";
import { APIRes } from "@/core/types/api";
import { NetworkRepository } from "./contract";

export const NetworkRepositoryLive = Layer.effect(
  NetworkRepository,
  Effect.gen(function* (_) {
    const http = yield* _(HttpClient);

    return {
      getAll() {
        return pipe(
          Http.get("/home/network-coverages"),
          Res.filterStatusOk(),
          Res.toJson<APIRes<Array<Network>>>(),
          http.make
        );
      },
    };
  })
);
