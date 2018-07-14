// flow-typed signature: c467878b1e98defeb6fe02cc880c6474
// flow-typed version: <<STUB>>/popper.js_v^1.14.3/flow_v0.76.0

/**
 * Until https://github.com/FezVrasta/popper.js/pull/602 released
 */

/**
 * We include stubs for each file inside this npm package in case you need to
 * require those files directly. Feel free to delete any files that aren't
 * needed.
 */

declare module 'popper.js' {
  declare module .exports: any
}

declare module 'popper.js/dist/popper-utils' {
  declare export type popper$Offset = {|
    bottom: number,
    height: number,
    left: number,
    marginLeft: number,
    marginTop: number,
    right: number,
    top: number,
    width: number,
  |};
  declare module .exports: {
    getReferenceOffsets: (mixed, HTMLElement, HTMLElement, ?boolean) => popper$Offset,
  }
}

