import React from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';
import Popper from 'popper.js';
// Use "umd" since somehow Babel on Mocha cannot make use of popper.js/dist/popper-utils
import { getReferenceOffsets, getScroll } from 'popper.js/dist/umd/popper-utils';
import type { popper$Offset } from 'popper.js/dist/popper-utils';
import debounce from 'lodash.debounce';
import animateScrollTo from 'animated-scroll-to';
import type { SeriesId } from './series';
import { seriesPool } from './series';
import {
  classnames, overlayRootClassName, panelClassName, rootClassName, spotClassName,
} from './classNames';
import KindnessPanelContent from './KindnessPanelContent';
import { KindnessPanelContentProps } from './types';

const OVERLAY_TRANSITION_DELAY = 400;
const SPOT_MARGIN = 8;
const SPOT_MAX_RADIUS = 56;

type SvgRect = {
  x?: number,
  y?: number,
  width?: number | string,
  height?: number | string,
}

export type KindnessPanelProps = {|
  enabled: boolean,
  onExit: Function,
  spotType?: 'circle' | 'rect',
  initialIndex?: number,
  children?: (KindnessPanelContentProps) => React.Component,
  seriesId?: SeriesId,
|};

export type KindnessPanelState = {|
  spotIndex: number,
|}

export default class KindnessPanel
  extends React.Component<KindnessPanelProps, KindnessPanelState> {
  constructor(props: KindnessPanelProps) {
    super(props);
    this.state = {
      spotStyle: {},
      overlayStyle: {},
    };

    this.spotIndex = -1;
    this.series = seriesPool.getOrCreate(props.seriesId);
    this.isResizeObserved = false;
    this.popper = null;
    this.panel = React.createRef();
    this.spot = React.createRef();
    this.canvas = React.createRef();

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

  componentDidUpdate(prevProps: KindnessPanelProps, prevState: KindnessPanelState) {
    const { enabled, initialIndex } = this.props;
    const { spotStyle } = this.state;
    const { spotIndex } = this;

    if (!prevProps.enabled && enabled) {
      this.updateSpot(spotIndex);
    } else if (prevProps.enabled && !enabled && this.popper) {
      this.disposeListeners();
    }

    if (this.spotIndex >= 0
      && this.canvas.current
      && this.spot.current
      && prevState.spotStyle && spotStyle
      && (getSpotTop(prevState.spotStyle) !== getSpotTop(spotStyle))) {
      const scrollTop = getScroll(global.document.documentElement);
      const { clientHeight } = global.document.documentElement;

      if (scrollTop + clientHeight < getSpotTop(spotStyle)) {
        animateScrollTo(getScrollYOfSpotBottom(spotStyle));
      } else if (scrollTop > getSpotBottom(spotStyle)) {
        animateScrollTo(getSpotTop(spotStyle));
      }
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
      spotStyle: this.createSpotStyle(this.spotIndex),
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
    const spotStyle = this.createSpotStyle(newIndex);
    this.setState({
      spotStyle,
      overlayStyle: createOverlayStyle(),
    });
  }

  forceUpdateOverlaySVG() {
    // At least Chrome often fails drawing overlay rect after window resize
    if (!this.canvas.current) return;
    const old = this.canvas.current.getAttribute('width');
    this.canvas.current.setAttribute('width', '200%');
    setTimeout(() => {
      if (!this.canvas.current) return;
      this.canvas.current.setAttribute('width', old);
    });
  }

  incSpotIndex(increment) {
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

    if (!this.isResizeObserved) {
      global.addEventListener('resize', this.onWindowResize);
      this.isResizeObserved = true;
    }
  }

  disposeListeners() {
    if (this.popper) {
      this.popper.destroy();
      this.popper = null;
    }
    if (this.isResizeObserved) {
      global.removeEventListener('resize', this.onWindowResize);
      this.isResizeObserved = false;
    }
  }

  createSpotStyle(spotIndex: number): ?SvgRect {
    if (this.panel.current && this.spot.current && this.series.hasKindnessByIndex(spotIndex)) {
      const targetEl = this.series.getKindnessElementByIndex(spotIndex);
      const offset = getReferenceOffsets(null, this.spot.current, targetEl);
      const { spotType } = this.props;

      return spotType === 'rect' ? createRectSvgStyle(offset) : createCircleSvgStyle(offset);
    }
    return null;
  }

  render() {
    if (!global.document) return null;
    const { enabled, spotType, children } = this.props;
    const { spotStyle, overlayStyle } = this.state;
    const k = this.series.getKindnessByIndex(this.spotIndex);
    const { title, message } = k ? k.props : {};
    const { spotIndex } = this;

    const wasMounted = Boolean(this.spot.current);
    const panelContentProps: KindnessPanelContentProps = {
      title,
      message,
      totalSize: this.series.size,
      currentIndex: this.spotIndex,
      onGoPrevClick: this.series.hasKindnessByIndex(spotIndex - 1) ? this.goPrev : null,
      onGoNextClick: this.series.hasKindnessByIndex(spotIndex + 1) ? this.goNext : null,
      onGoIndexClick: this.goIndex,
      onSkipClick: this.skip,
    };
    return (
      ReactDOM.createPortal(
        <CSSTransition
          in={wasMounted && enabled}
          timeout={OVERLAY_TRANSITION_DELAY}
          classNames={`${rootClassName}-`}
          onExited={this.onOverlayDisapeared}
        >
          {() => (
            <React.Fragment>
              <div className={classnames(rootClassName)}>
                <svg
                  ref={this.canvas}
                  className={overlayRootClassName}
                  style={overlayStyle}
                  width="100%"
                  height="100%"
                >
                  <filter id="blurMe">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
                  </filter>
                  <mask id="mask0">
                    <g fill="black">
                      <rect x="0" y="0" width="100%" height="100%" fill="white" />
                      {React.createElement(spotType, {
                        className: spotClassName,
                        ref: this.spot,
                        fill: 'black',
                        filter: 'url(#blurMe)',
                        ...spotStyle,
                      })}
                    </g>
                  </mask>
                  <rect
                    width="100%"
                    height="100%"
                    fill="black"
                    opacity=".15"
                    mask="url(#mask0)"
                  />
                </svg>
                {enabled
                  ? (
                    <div
                      ref={this.panel}
                      className={panelClassName}
                    >
                      {children(panelContentProps)}
                    </div>
                  )
                  : null
                }
              </div>
              {/* /!* TODO: how can i contain panel inside of react-kindness root *!/ */}
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
  spotType: 'circle',
  seriesId: 'default',
  children: panelContentProps => <KindnessPanelContent {...panelContentProps} />,
};

function getScrollYOfSpotBottom(spotStyle) {
  if (isNumber(spotStyle.cy)) {
    return spotStyle.cy + spotStyle.r - global.document.documentElement.clientHeight;
  } if (isNumber(spotStyle.y)) {
    return spotStyle.y;
  }
  return -1;
}

function getSpotTop(spotStyle) {
  if (isNumber(spotStyle.cy)) {
    return spotStyle.cy - spotStyle.r;
  } if (isNumber(spotStyle.y)) {
    return spotStyle.y;
  }
  return -1;
}

function getSpotBottom(spotStyle) {
  if (isNumber(spotStyle.cy)) {
    return spotStyle.cy + spotStyle.r;
  } if (isNumber(spotStyle.y)) {
    return spotStyle.y + spotStyle.height;
  }
  return -1;
}

// function getSpotY(spotStyle) {
//   if (isNumber(spotStyle.cx)) {
//     return spotStyle.cx
//   } else if (isNumber(spotStyle.x)) {
//     return spotStyle.x;
//   }
//   throw new Error('a?');
// }

function isNumber(v) {
  return typeof v === 'number';
}

function createCircleSvgStyle(popperOffset: popper$Offset) {
  const wc = (popperOffset.width / 2);
  const hc = (popperOffset.height / 2);
  const rad = wc + (SPOT_MARGIN * 2);
  return {
    cx: popperOffset.left + wc, // - SPOT_MARGIN - global.scrollX,
    cy: popperOffset.top + hc, // - SPOT_MARGIN - global.scrollY,
    r: Math.min(rad, SPOT_MAX_RADIUS),
  };
}

function createRectSvgStyle(popperOffset: popper$Offset) {
  return {
    x: popperOffset.left - SPOT_MARGIN - global.scrollX,
    y: popperOffset.top - SPOT_MARGIN - global.scrollY,
    width: popperOffset.width + (SPOT_MARGIN * 2),
    height: popperOffset.height + (SPOT_MARGIN * 2),
  };
}

function createOverlayStyle() {
  return {
    width: document.documentElement.offsetWidth,
    height: document.documentElement.offsetHeight,
  };
}
