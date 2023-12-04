import { pipe } from "@effect/data/Function";
import * as Option from "@effect/data/Option";
import * as Effect from "@effect/io/Effect";

import { Storage } from "../adapters/storage/contract";
import { Unauthorized } from "../exceptions/authentication";
import { Authentication } from "../models/authentication";
import {
  AuthenticationRepository,
  AuthenticationInfo,
} from "../repository/authentication/contract";
import { UserRepository } from "../repository/user/contract";
import { toApiError } from "./utils";

const StoreKey = "authentication";

export function login(info: AuthenticationInfo) {
  return pipe(
    Effect.flatMap(AuthenticationRepository, (repo) => repo.signIn(info)),
    Effect.tap(persist),
    Effect.catchTag("StatusError", (e) => {
      return Effect.unified(
        e.response.status === 401
          ? Effect.fail(new Unauthorized("Wrong username or password"))
          : toApiError(e)
      );
    })
  );
}

export function persist(auth: Authentication) {
  return Effect.flatMap(Storage, (store) => {
    return Effect.sync(() => store.setItem(StoreKey, JSON.stringify(auth)));
  });
}

export function getAuthentication() {
  return pipe(
    Effect.flatMap(Storage, (store) => {
      return Effect.sync(() => store.getItem(StoreKey));
    }),
    Effect.flatMap(Option.map((str) => JSON.parse(str) as Authentication))
  );
}

export function invalidate() {
  return Effect.flatMap(Storage, (store) => {
    return Effect.sync(() => store.removeItem(StoreKey));
  });
}

export function changePassword(args: {
  oldPassword: string;
  newPassword: string;
}) {
  return pipe(
    Effect.flatMap(UserRepository, (repo) => repo.changePassword(args)),
    Effect.tap(invalidate)
  );
}
