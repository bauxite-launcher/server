// flow-typed signature: ec961231a1fe152c66d3dadaccce9d2a
// flow-typed version: <<STUB>>/node-fetch_v^2.2.0/flow_v0.81.0

/**
 * This is an autogenerated libdef stub for:
 *
 *   'node-fetch'
 *
 * Fill this stub out by replacing all the `any` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

declare module "node-fetch" {
  import type { Readable } from "stream";

  declare type Headers = {
    raw: () => { [key: string]: string },
    get: (key: string) => string
  };

  declare export type FetchOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "HEAD"
  };

  declare export type FetchResult<T: Object | Array<Object>> = {
    status: number,
    statusText: string,
    headers: Headers,
    ok: boolean,
    body: Readable,
    buffer(): Promise<Buffer>,
    text(): Promise<string>,
    json(): Promise<T>
  };

  declare export default function fetch<T>(
    url: string,
    fetchOptions: ?FetchOptions
  ): Promise<FetchResult<T>>;
}
