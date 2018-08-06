import type EventEmitter from 'events';

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
