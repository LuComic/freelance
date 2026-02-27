/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as connections_mutations from "../connections/mutations.js";
import type * as connections_queries from "../connections/queries.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as lib_slugs from "../lib/slugs.js";
import type * as lib_storage from "../lib/storage.js";
import type * as lib_validators from "../lib/validators.js";
import type * as pageRuntime_analytics from "../pageRuntime/analytics.js";
import type * as pageRuntime_feedback from "../pageRuntime/feedback.js";
import type * as pageRuntime_forms from "../pageRuntime/forms.js";
import type * as pageRuntime_progress from "../pageRuntime/progress.js";
import type * as pages_content from "../pages/content.js";
import type * as pages_mutations from "../pages/mutations.js";
import type * as pages_queries from "../pages/queries.js";
import type * as projects_invites from "../projects/invites.js";
import type * as projects_members from "../projects/members.js";
import type * as projects_mutations from "../projects/mutations.js";
import type * as projects_queries from "../projects/queries.js";
import type * as search_queries from "../search/queries.js";
import type * as templates_content from "../templates/content.js";
import type * as templates_mutations from "../templates/mutations.js";
import type * as templates_queries from "../templates/queries.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "connections/mutations": typeof connections_mutations;
  "connections/queries": typeof connections_queries;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/errors": typeof lib_errors;
  "lib/permissions": typeof lib_permissions;
  "lib/slugs": typeof lib_slugs;
  "lib/storage": typeof lib_storage;
  "lib/validators": typeof lib_validators;
  "pageRuntime/analytics": typeof pageRuntime_analytics;
  "pageRuntime/feedback": typeof pageRuntime_feedback;
  "pageRuntime/forms": typeof pageRuntime_forms;
  "pageRuntime/progress": typeof pageRuntime_progress;
  "pages/content": typeof pages_content;
  "pages/mutations": typeof pages_mutations;
  "pages/queries": typeof pages_queries;
  "projects/invites": typeof projects_invites;
  "projects/members": typeof projects_members;
  "projects/mutations": typeof projects_mutations;
  "projects/queries": typeof projects_queries;
  "search/queries": typeof search_queries;
  "templates/content": typeof templates_content;
  "templates/mutations": typeof templates_mutations;
  "templates/queries": typeof templates_queries;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
