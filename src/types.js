// @flow

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
  onExit: Function,
  shape?: 'circle' | 'rect',
  initialIndex?: number,
  children?: (KindnessPanelContentProps) => React.Component,
  seriesId?: SeriesId,
  onClickOutside?: () => ?boolean,
|};

export type KindnessPanelState = {|
  spotOffset: ?popper$Offset,
  overlayStyle: ?RectSize
|}

export type KindnessProps = {|
  // eslint-disable-next-line react/no-unused-prop-types
  shape?: 'circle' | 'rect',
  // eslint-disable-next-line react/no-unused-prop-types
  title?: mixed,
  // eslint-disable-next-line react/no-unused-prop-types
  message?: mixed,
  order?: number | 'auto',
  seriesId?: SeriesId,
  children: mixed,
|}

export type KindnessPanelContentProps = {|
  title: mixed,
  message: mixed,
  totalSize: number,
  currentIndex: number,
  goPrev: ?Function,
  goNext: ?Function,
  skip: Function,
  goIndex: Function,
  transitionEmitter: EventEmitter,
|};
