import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Http from "http-kit";
import * as Res from "http-kit/response";
import { json } from "http-kit/body";
import { UserRepository } from "./contract";
import { HttpClient } from "@/common/http-client";
import { toApiError } from "../utils";

export const UserRepositoryLive = Layer.effect(
  UserRepository,
  Effect.gen(function* (_) {
    const http = yield* _(HttpClient);

    return {
      changePassword(args) {
        return pipe(
          Http.put("/profile/change-password", json(args)),
          Res.filterStatusOk(),
          Effect.catchTag("StatusError", toApiError),
          http.make,
        );
      },
    };
  }),
);
