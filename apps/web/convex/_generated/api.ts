/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";
import { anyApi } from "convex/server";
import type * as users from "../users.js";
import type * as seed from "../seed.js";
import type * as instances from "../instances.js";
import type * as actions from "../actions.js";

const fullApi: ApiFromModules<{
  "users": typeof users,
  "seed": typeof seed,
  "instances": typeof instances,
  "actions": typeof actions,
}> = anyApi as any;

export const api: FilterApi<typeof fullApi, FunctionReference<any, "public">> = anyApi as any;

export const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">> = anyApi as any;
