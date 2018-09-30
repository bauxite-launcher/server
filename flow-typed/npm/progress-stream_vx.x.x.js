// flow-typed signature: 64b351e970ec1528ff45a064cf8ca4c1
// flow-typed version: <<STUB>>/progress-stream_v^2.0.0/flow_v0.81.0

/**
 * This is an autogenerated libdef stub for:
 *
 *   'progress-stream'
 *
 * Fill this stub out by replacing all the `any` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

declare module "progress-stream" {
  import type { Duplex } from "stream";

  declare export type StreamProgressOptions = {
    /** Sets how often progress events are emitted in ms. If omitted then the default is to do so every time a chunk is received. */
    time?: ?number,
    /** Sets how long the speedometer needs to calculate the speed. Defaults to 5 sec. */
    speed?: ?number,
    /** If you already know the length of the stream, then you can set it. Defaults to 0. */
    length?: ?number,
    /** In case you don't want to include a readstream after progress-stream, set to true to drain automatically. Defaults to false. */
    drain?: ?boolean,
    /** If you want to set the size of previously downloaded data. Useful for a resumed download. */
    transferred?: ?number
  };

  declare export type StreamProgressEvent = {
    percentage: number,
    transferred: number,
    length: number,
    remaining: number,
    eta: number,
    runtime: number,
    delta: number,
    speed: number
  };

  declare export type StreamProgress = Duplex & {
    setLength: (length: number) => void
  };

  declare export type StreamProgressCallback = (
    progress: StreamProgressEvent
  ) => void;

  declare function StreamProgressFactory(): StreamProgress;
  declare function StreamProgressFactory(
    onProgress: StreamProgressCallback
  ): StreamProgress;
  declare export default function StreamProgressFactory(
    options: StreamProgressOptions,
    onProgress?: StreamProgressCallback
  ): StreamProgress;
}

/**
 * We include stubs for each file inside this npm package in case you need to
 * require those files directly. Feel free to delete any files that aren't
 * needed.
 */

// Filename aliases
declare module "progress-stream/index" {
  declare module.exports: $Exports<"progress-stream">;
}
declare module "progress-stream/index.js" {
  declare module.exports: $Exports<"progress-stream">;
}