import * as Context from "@effect/data/Context";
import * as Layer from "@effect/io/Layer";
import { FeatureService as IFeatureService } from "@/libs/spectrum/services/FeatureService";
import { ServiceOptions } from "@/libs/spectrum/services/Service";

export const FeatureService = Context.Tag<IFeatureService>();

export function createFeatureService(url: string, options?: ServiceOptions) {
  return Layer.succeed(FeatureService, new IFeatureService(url, options));
}
