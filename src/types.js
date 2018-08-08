// @flow
// eslint-disable react/no-unused-prop-types

import React from 'react';
import type { popper$Offset } from 'popper.js/dist/popper-utils';
import type EventEmitter from 'events';

// ESLint provides an error for opaque
export type SeriesId = string;

export type RectSize = {|
  width: number,
  height: number,
|};

export type KindnessPanelProps = {|
  enabled: boolean,
  onExit: () => void,
  shape?: 'circle' | 'rect', // 'circle' by default
  initialIndex?: number, // 0 by default
  children?: (KindnessPanelContentArgs) => React.Component,
  seriesId?: SeriesId, // 'default' by default
  onClickOutside?: () => ?boolean, // () => {} by default.
                                   // If false was returned, react-kindness
                                   // tries to disable user interactions.
|};

export type KindnessPanelState = {|
  spotOffset: ?popper$Offset,
  overlayStyle: ?RectSize
|}

export type KindnessProps = {|
  children: mixed,
  shape?: 'circle' | 'rect', // Use <KindnessPanel shape={} /> by default and being able to override it
  title?: mixed, // null by default
  message?: mixed, // null by default
  order?: number | 'auto', // 'auto' by default
  seriesId?: SeriesId, // 'default' by default
|}

export type KindnessPanelContentArgs = {|
  title: mixed,
  message: mixed,
  totalSize: number,
  currentIndex: number,
  goPrev: () => void,
  goNext: () => void,
  skip: () => void,
  goIndex: (number) => void,
  transitionEmitter: EventEmitter,
|};
