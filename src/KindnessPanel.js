import React from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';
import Popper from 'popper.js';
// Use "umd" since somehow Babel on Mocha cannot make use of popper.js/dist/popper-utils
import { getReferenceOffsets, getScroll } from 'popper.js/dist/umd/popper-utils';
import type { popper$Offset } from 'popper.js/dist/popper-utils';
import debounce from 'lodash.debounce';
import animateScrollTo from 'animated-scroll-to';
import EventEmitter from 'events';

import type { SeriesId } from './series';
import { seriesPool } from './series';
import {
  classnames, svgClassName, overlayClassName, panelClassName, rootClassName, spotClassName,
} from './classNames';
import KindnessPanelContent from './KindnessPanelContent';
import { KindnessPanelContentProps } from './types';

const OVERLAY_TRANSITION_DELAY = 400;
const SPOT_MARGIN = 8;
const SPOT_MAX_RADIUS = 56;

export type KindnessPanelProps = {|
  enabled: boolean,
  onExit: Function,
  shape?: 'circle' | 'rect',
  initialIndex?: number,
  children?: (KindnessPanelContentProps) => React.Component,
  seriesId?: SeriesId,
  onClickOutside?: () => ?boolean,
|};

type Size = {|
  width: number,
  height: number,
|};

export type KindnessPanelState = {|
  spotOffset: ?popper$Offset,
  overlayStyle: ?Size
|}

export default class KindnessPanel
  extends React.Component<KindnessPanelProps, KindnessPanelState> {
  constructor(props: KindnessPanelProps) {
    super(props);

    this.state = {
      spotOffset: null,
      overlayStyle: {},
    };

    this.onClickOutside = (e) => {
      const { enabled } = this.props;
      if (!enabled) return;
      if (!this.panel.current) return;
      if (!this.series.hasKindnessByIndex(this.spotIndex)) return;
      const kEl = this.series.getKindnessElementByIndex(this.spotIndex);
      if (this.panel.current.contains(e.target) || kEl.contains(e.target)) return;
      const rv = props.onClickOutside(e);

      if (rv === false) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (!this.svg.current) return;
        // Block the user interaction
        const handler = () => {
          setTimeout(() => {
            this.svg.current.style.pointerEvents = '';
            document.removeEventListener('mouseup', handler);
          });
        };
        document.addEventListener('mouseup', handler);
        this.svg.current.style.pointerEvents = 'auto';
      }
    };

    this.spotIndex = -1;
    this.series = seriesPool.getOrCreate(props.seriesId);
    this.isViewportEventObserved = false;
    this.popper = null;
    this.panel = React.createRef();
    this.spot = React.createRef();
    this.svg = React.createRef();
    this.transitionEmitter = new EventEmitter();

    this.onWindowResize = debounce(this.updateOverlayStyle, 10);
  }

  // componentWillMount() {
  //   if (!global.document) return;
  // }

  componentDidMount() {
    const { enabled, initialIndex } = this.props;
    if (enabled) {
      // Wait for mount of children
      setTimeout(() => {
        this.updateSpot(initialIndex);
      }, 0);
    } else {
      this.spotIndex = initialIndex;
    }
  }

  componentDidUpdate(prevProps: KindnessPanelProps) {
    const { enabled } = this.props;
    const { spotIndex } = this;

    if (!prevProps.enabled && enabled) {
      this.updateSpot(spotIndex);
    }
  }

  componentWillUnmount() {
    if (!global.document) return;
    this.disposeListeners();
  }

  onOverlayDisapeared = () => {
    const { initialIndex } = this.props;
    this.spotIndex = initialIndex;
    this.disposeListeners();
  };

  updateOverlayStyle = () => {
    this.setState({
      spotOffset: this.createSpotOffset(this.spotIndex),
      overlayStyle: createOverlayStyle(),
    });
    this.forceUpdateOverlaySVG();
  };

  skip = () => {
    const { onExit } = this.props;
    onExit();
  };

  goNext = () => {
    this.incSpotIndex(true);
  };

  goPrev = () => {
    this.incSpotIndex(false);
  };

  goIndex = (index) => {
    if (!this.series.hasKindnessByIndex(index)) return;
    this.updateSpot(index);
  };

  updateSpot(newIndex) {
    this.spotIndex = newIndex;
    this.reattachListeners(newIndex);
    const spotOffset = this.createSpotOffset(newIndex);
    this.setState({
      spotOffset,
      overlayStyle: createOverlayStyle(),
    });

    if (newIndex >= 0
      && this.svg.current
      && this.spot.current
      && spotOffset) {
      scrollViewport('y', spotOffset);
      scrollViewport('x', spotOffset);
    }
  }

  forceUpdateOverlaySVG() {
    // At least Chrome often fails drawing overlay rect after window resize
    if (!this.svg.current) return;
    const old = this.svg.current.getAttribute('width');
    this.svg.current.setAttribute('width', '200%');
    setTimeout(() => {
      if (!this.svg.current) return;
      this.svg.current.setAttribute('width', old);
    });
  }

  incSpotIndex(increment: boolean) {
    const { spotIndex } = this;
    const newIndex = spotIndex + (increment ? 1 : -1);
    this.goIndex(newIndex);
  }

  reattachListeners(spotIndex: number): void {
    if (!this.panel) throw new Error('');

    this.disposeListeners();

    if (this.series.hasKindnessByIndex(spotIndex)) {
      const targetEl = this.series.getKindnessElementByIndex(spotIndex);
      if (!targetEl) throw new Error('!??');
      this.popper = new Popper(targetEl, this.panel.current);
    }

    if (!this.isViewportEventObserved) {
      global.addEventListener('resize', this.onWindowResize);
      global.document.addEventListener('mousedown', this.onClickOutside, true);
      this.isViewportEventObserved = true;
    }
  }

  disposeListeners() {
    if (this.popper) {
      this.popper.destroy();
      this.popper = null;
    }
    if (this.isViewportEventObserved) {
      global.removeEventListener('resize', this.onWindowResize);
      global.document.removeEventListener('mousedown', this.onClickOutside, true);
      this.isViewportEventObserved = false;
    }
  }

  createSpotOffset(spotIndex: number): ?popper$Offset {
    if (this.panel.current && this.spot.current && this.series.hasKindnessByIndex(spotIndex)) {
      const targetEl = this.series.getKindnessElementByIndex(spotIndex);
      return getReferenceOffsets(null, this.spot.current, targetEl);
    }
    return null;
  }

  render() {
    if (!global.document) return null;
    const { enabled, shape: spotShapeBase, children } = this.props;
    const { spotOffset, overlayStyle } = this.state;
    const k = this.series.getKindnessByIndex(this.spotIndex);
    const { shape: spotShapeSpecific, title, message } = k ? k.props : {};
    const { spotIndex } = this;
    const spotShape = spotShapeSpecific || spotShapeBase;

    let spotStyle = null;
    if (spotOffset) {
      if (spotShape === 'rect') {
        spotStyle = createRectSvgStyle(spotOffset);
      } else {
        // TODO: refac
        const { cx, cy, r } = createCircleSvgStyle(spotOffset);
        spotStyle = {
          x: cx - r,
          y: cy - r,
          rx: r,
          ry: r,
          width: r * 2,
          height: r * 2,
        };
      }
    }

    const wasMounted = Boolean(this.spot.current);
    const panelContentProps: KindnessPanelContentProps = {
      title,
      message,
      totalSize: this.series.size,
      currentIndex: this.spotIndex,
      goPrev: this.series.hasKindnessByIndex(spotIndex - 1) ? this.goPrev : null,
      goNext: this.series.hasKindnessByIndex(spotIndex + 1) ? this.goNext : null,
      goIndex: this.goIndex,
      skip: this.skip,
      transitionEmitter: this.transitionEmitter,
    };

    return (
      ReactDOM.createPortal(
        <CSSTransition
          in={wasMounted && enabled}
          timeout={OVERLAY_TRANSITION_DELAY}
          classNames={`${rootClassName}-`}
          onEntered={() => this.transitionEmitter.emit('onEntered')}
          onExited={this.onOverlayDisapeared}
        >
          {() => (
            <React.Fragment>
              <div className={classnames(rootClassName)}>
                <svg
                  ref={this.svg}
                  className={svgClassName}
                  style={overlayStyle}
                  width="100%"
                  height="100%"
                >
                  <filter id="blurFilter">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
                  </filter>
                  <mask id="spot">
                    <g fill="black">
                      <rect x="0" y="0" width="100%" height="100%" fill="white" />
                      <rect
                        className={spotClassName}
                        ref={this.spot}
                        fill="black"
                        filter="url(#blurFilter)"
                        {...(spotOffset ? spotStyle : null)}
                      />
                    </g>
                  </mask>
                  <rect
                    className={overlayClassName}
                    mask="url(#spot)"
                  />
                </svg>
                <div
                  ref={this.panel}
                  className={panelClassName}
                >
                  {children(panelContentProps)}
                </div>
              </div>
            </React.Fragment>
          )}
        </CSSTransition>,
        global.document.body,
      )
    );
  }
}

KindnessPanel.defaultProps = {
  initialIndex: 0,
  shape: 'circle',
  seriesId: 'default',
  children: panelContentProps => <KindnessPanelContent {...panelContentProps} />,
  onClickOutside: () => {},
};

function scrollViewport(axis, spotOffset) {
  const offsetProp = axis === 'x' ? 'left' : 'top';
  const sizeProp = axis === 'x' ? 'width' : 'height';
  const horizontal = axis === 'x';
  const scrollSize = getScroll(global.document.documentElement, offsetProp);
  const viewportSize = axis === 'x'
    ? global.document.documentElement.clientWidth
    : global.document.documentElement.clientHeight;
  const offsetSize = spotOffset[offsetProp];
  const spotEdge = offsetSize + spotOffset[sizeProp];

  if (scrollSize + viewportSize < offsetSize) {
    animateScrollTo(spotEdge - viewportSize, { horizontal, offset: SPOT_MARGIN });
  } else if (scrollSize > spotEdge) {
    animateScrollTo(offsetSize, { horizontal, offset: SPOT_MARGIN });
  }
}

function createCircleSvgStyle(popperOffset: popper$Offset) {
  const wc = (popperOffset.width / 2);
  const hc = (popperOffset.height / 2);
  const rad = wc + (SPOT_MARGIN * 2);
  return {
    cx: popperOffset.left + wc,
    cy: popperOffset.top + hc,
    r: Math.min(rad, SPOT_MAX_RADIUS),
  };
}

function createRectSvgStyle(popperOffset: popper$Offset) {
  return {
    x: popperOffset.left - SPOT_MARGIN,
    y: popperOffset.top - SPOT_MARGIN,
    width: popperOffset.width + (SPOT_MARGIN * 2),
    height: popperOffset.height + (SPOT_MARGIN * 2),
  };
}

function createOverlayStyle() {
  const d = global.document.documentElement;
  const b = global.document.body;
  return {
    width: Math.max(d.clientWidth, d.offsetWidth, b.scrollWidth),
    height: Math.max(d.clientHeight, d.offsetHeight, b.scrollHeight),
  };
}
