import {
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from "@chakra-ui/react";
import {
  ActionFunctionArgs,
  Form,
  useActionData,
  useLocation,
  useNavigation,
} from "react-router-dom";

import * as Either from "@effect/data/Either";
import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";

import { HttpClientLiveNoAuth } from "@/common/http-client";
import { PasswordInput } from "@/components/password";
import { SessionStorageLive } from "@/core/adapters/storage/implementation";
import { Unauthorized } from "@/core/exceptions/authentication";
import { redirect, toFormData } from "@/libs/react-router-dom";
import { useEffect } from "react";
import { AuthenticationInfo } from "../../core/repository/authentication/contract";
import { AuthenticationRepositoryLive } from "../../core/repository/authentication/implementation";
import * as AuthService from "../../core/services/authentication";

export function loader() {
  const result = pipe(
    AuthService.getAuthentication(),
    Effect.flatMap(() => redirect("/")),
    Effect.provideLayer(SessionStorageLive),
    Effect.either,
    Effect.runSync
  );

  if (Either.isRight(result)) {
    throw result.right;
  }

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const layer = AuthenticationRepositoryLive.pipe(
    Layer.useMerge(HttpClientLiveNoAuth),
    Layer.useMerge(SessionStorageLive)
  );

  const result = await pipe(
    toFormData(request),
    Effect.flatMap((info) =>
      AuthService.login(Object.fromEntries(info) as AuthenticationInfo)
    ),
    Effect.flatMap((auth) => {
      const url = new URL(request.url);
      const continueTo = url.searchParams.get("continueTo") ?? "/";
      return auth.firstTimeLoggedIn
        ? redirect("/change-password")
        : redirect(continueTo);
    }),
    Effect.provideLayer(layer),
    Effect.either,
    Effect.runPromise
  );

  if (Either.isRight(result)) {
    throw result.right;
  }

  return result;
}

export function Login() {
  const toast = useToast();

  const location = useLocation();

  const navigation = useNavigation();

  const from = location.state?.from?.pathname || "/";

  const data = useActionData() as Awaited<ReturnType<typeof action>>;

  useEffect(() => {
    if (data && Either.isLeft(data)) {
      const { left } = data;
      const reason =
        left instanceof Unauthorized
          ? left.reason
          : "error" in left
          ? left.error
          : "An unexpected error occurred";

      toast({ status: "error", description: reason });
    }
  }, [data, toast]);

  return (
    <div
      style={{ backgroundImage: "url(bg.jpg)" }}
      className="h-screen bg-cover bg-center"
    >
      <div
        //className="h-full lg:p-12 p-4  bg-blue-500/50 backdrop-brightness-75"
        className="h-full lg:p-12 p-4  backdrop-brightness-75"
      >
        <main className="h-full flex items-center justify-center lg:w-2/5 ml-auto">
          <figure className="space-y-8 w-full bg-white rounded-md p-10">
            <figcaption className="space-y-10">
              <img src="/brand-icon.png" className="mx-auto h-[4.5rem] w-[4.5rem]" />
              <h1 className="text-4xl font-semibold">Login</h1>
            </figcaption>

            <Form
              method="post"
              className="space-y-6 w-full"
              action={`/login?continueTo=${from}`}
            >
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input name="username" />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <PasswordInput name="password" />
              </FormControl>

              <Button
                type="submit"
                className="block w-9/12 mx-auto"
                isLoading={navigation.state === "submitting"}
              >
                Sign In
              </Button>
            </Form>
          </figure>
        </main>
      </div>
    </div>
  );
}
