/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents__model_agent from "../agents/_model/agent.js";
import type * as agents_agents_mutations from "../agents/agents/mutations.js";
import type * as agents_agents_queries from "../agents/agents/queries.js";
import type * as agents_lib_schedule from "../agents/lib/schedule.js";
import type * as agents_logs_mutations from "../agents/logs/mutations.js";
import type * as agents_logs_queries from "../agents/logs/queries.js";
import type * as agents_run_actions from "../agents/run/actions.js";
import type * as agents_run_scheduled from "../agents/run/scheduled.js";
import type * as auth from "../auth.js";
import type * as calendar__model_calendarEvent from "../calendar/_model/calendarEvent.js";
import type * as calendar_events_mutations from "../calendar/events/mutations.js";
import type * as calendar_events_queries from "../calendar/events/queries.js";
import type * as codediff__model_file from "../codediff/_model/file.js";
import type * as codediff__model_repo from "../codediff/_model/repo.js";
import type * as codediff_files_mutations from "../codediff/files/mutations.js";
import type * as codediff_files_queries from "../codediff/files/queries.js";
import type * as codediff_repos_mutations from "../codediff/repos/mutations.js";
import type * as codediff_repos_queries from "../codediff/repos/queries.js";
import type * as codediff_sync_actions from "../codediff/sync/actions.js";
import type * as crons from "../crons.js";
import type * as datalake__model_connection from "../datalake/_model/connection.js";
import type * as datalake__model_item from "../datalake/_model/item.js";
import type * as datalake_connections_mutations from "../datalake/connections/mutations.js";
import type * as datalake_connections_queries from "../datalake/connections/queries.js";
import type * as datalake_items_mutations from "../datalake/items/mutations.js";
import type * as datalake_items_queries from "../datalake/items/queries.js";
import type * as datalake_sync_actions from "../datalake/sync/actions.js";
import type * as feedback__model_feedback from "../feedback/_model/feedback.js";
import type * as feedback_feedback_mutations from "../feedback/feedback/mutations.js";
import type * as feedback_feedback_queries from "../feedback/feedback/queries.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as organizations__model_organization from "../organizations/_model/organization.js";
import type * as organizations_orgs_mutations from "../organizations/orgs/mutations.js";
import type * as organizations_orgs_queries from "../organizations/orgs/queries.js";
import type * as projects__model_project from "../projects/_model/project.js";
import type * as projects_projects_mutations from "../projects/projects/mutations.js";
import type * as projects_projects_queries from "../projects/projects/queries.js";
import type * as tasks__model_task from "../tasks/_model/task.js";
import type * as tasks_mutations from "../tasks/mutations.js";
import type * as tasks_queries from "../tasks/queries.js";
import type * as tasks_tasks_mutations from "../tasks/tasks/mutations.js";
import type * as tasks_tasks_queries from "../tasks/tasks/queries.js";
import type * as telegram__model_telegram from "../telegram/_model/telegram.js";
import type * as telegram_bot_actions from "../telegram/bot/actions.js";
import type * as telegram_bot_mutations from "../telegram/bot/mutations.js";
import type * as telegram_bot_queries from "../telegram/bot/queries.js";
import type * as telegram_webhook_actions from "../telegram/webhook/actions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "agents/_model/agent": typeof agents__model_agent;
  "agents/agents/mutations": typeof agents_agents_mutations;
  "agents/agents/queries": typeof agents_agents_queries;
  "agents/lib/schedule": typeof agents_lib_schedule;
  "agents/logs/mutations": typeof agents_logs_mutations;
  "agents/logs/queries": typeof agents_logs_queries;
  "agents/run/actions": typeof agents_run_actions;
  "agents/run/scheduled": typeof agents_run_scheduled;
  auth: typeof auth;
  "calendar/_model/calendarEvent": typeof calendar__model_calendarEvent;
  "calendar/events/mutations": typeof calendar_events_mutations;
  "calendar/events/queries": typeof calendar_events_queries;
  "codediff/_model/file": typeof codediff__model_file;
  "codediff/_model/repo": typeof codediff__model_repo;
  "codediff/files/mutations": typeof codediff_files_mutations;
  "codediff/files/queries": typeof codediff_files_queries;
  "codediff/repos/mutations": typeof codediff_repos_mutations;
  "codediff/repos/queries": typeof codediff_repos_queries;
  "codediff/sync/actions": typeof codediff_sync_actions;
  crons: typeof crons;
  "datalake/_model/connection": typeof datalake__model_connection;
  "datalake/_model/item": typeof datalake__model_item;
  "datalake/connections/mutations": typeof datalake_connections_mutations;
  "datalake/connections/queries": typeof datalake_connections_queries;
  "datalake/items/mutations": typeof datalake_items_mutations;
  "datalake/items/queries": typeof datalake_items_queries;
  "datalake/sync/actions": typeof datalake_sync_actions;
  "feedback/_model/feedback": typeof feedback__model_feedback;
  "feedback/feedback/mutations": typeof feedback_feedback_mutations;
  "feedback/feedback/queries": typeof feedback_feedback_queries;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "organizations/_model/organization": typeof organizations__model_organization;
  "organizations/orgs/mutations": typeof organizations_orgs_mutations;
  "organizations/orgs/queries": typeof organizations_orgs_queries;
  "projects/_model/project": typeof projects__model_project;
  "projects/projects/mutations": typeof projects_projects_mutations;
  "projects/projects/queries": typeof projects_projects_queries;
  "tasks/_model/task": typeof tasks__model_task;
  "tasks/mutations": typeof tasks_mutations;
  "tasks/queries": typeof tasks_queries;
  "tasks/tasks/mutations": typeof tasks_tasks_mutations;
  "tasks/tasks/queries": typeof tasks_tasks_queries;
  "telegram/_model/telegram": typeof telegram__model_telegram;
  "telegram/bot/actions": typeof telegram_bot_actions;
  "telegram/bot/mutations": typeof telegram_bot_mutations;
  "telegram/bot/queries": typeof telegram_bot_queries;
  "telegram/webhook/actions": typeof telegram_webhook_actions;
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
