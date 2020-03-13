import React from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';
import Popper from 'popper.js';
import { getReferenceOffsets, getScroll } from 'popper.js/dist/popper-utils';

import debounce from 'lodash.debounce';
import animateScrollTo from 'animated-scroll-to';
import EventEmitter from 'events';

import { seriesPool } from './series';
import {
  classnames,
  svgClassName,
  overlayClassName,
  panelClassName,
  rootClassName,
  spotClassName,
} from './classNames';
import KindnessPanelContent from './KindnessPanelContent';

const OVERLAY_TRANSITION_DELAY = 400;
const SPOT_MARGIN = 8;
const SPOT_MIN_RADIUS = 56;
const SCROLL_OFFSET = 16;
const BLUR_STD_DEVIATION = 4;

export default class KindnessPanel extends React.Component {
  constructor(props) {
    if (!props.seriesId) throw new Error('never');
    super(props);

    this.state = {
      spotOffset: null,
      overlayStyle: {},
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

  componentDidUpdate(prevProps) {
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

  onDocumentClick = e => {
    const { enabled, onClickOutside } = this.props;
    if (!enabled) return;
    if (!this.panel.current) return;
    if (!this.series.hasKindnessByIndex(this.spotIndex)) return;
    const kEl = this.series.getKindnessElementByIndex(this.spotIndex);
    if (this.panel.current.contains(e.target) || kEl.contains(e.target)) return;
    const rv = onClickOutside(e);

    if (rv === false) {
      // Block the user interaction
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (!this.svg.current) return;
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

  goIndex = index => {
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

    if (newIndex >= 0 && this.svg.current && this.spot.current && spotOffset) {
      const k = this.series.getKindnessByIndex(this.spotIndex);
      const { shape: shapeSpecific } = k.props;
      const { shape: shapeBase } = this.props;
      scrollViewport('y', shapeSpecific || shapeBase, spotOffset);
      scrollViewport('x', shapeSpecific || shapeBase, spotOffset);
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

  incSpotIndex(increment) {
    const { spotIndex } = this;
    const newIndex = spotIndex + (increment ? 1 : -1);
    this.goIndex(newIndex);
  }

  reattachListeners(spotIndex) {
    if (!this.panel) throw new Error('');

    this.disposeListeners();

    if (this.series.hasKindnessByIndex(spotIndex)) {
      const targetEl = this.series.getKindnessElementByIndex(spotIndex);
      if (!targetEl) throw new Error('!??');
      this.popper = new Popper(targetEl, this.panel.current, {
        modifiers: {
          insideViewport: {
            order: 840,
            enabled: true,
            fn: insideViewport,
          },
        },
      });
    }

    if (!this.isViewportEventObserved) {
      global.addEventListener('resize', this.onWindowResize);
      global.document.addEventListener('mousedown', this.onDocumentClick, true);
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
      global.document.removeEventListener(
        'mousedown',
        this.onDocumentClick,
        true,
      );
      this.isViewportEventObserved = false;
    }
  }

  createSpotOffset(spotIndex) {
    if (
      this.panel.current &&
      this.spot.current &&
      this.series.hasKindnessByIndex(spotIndex)
    ) {
      const targetEl = this.series.getKindnessElementByIndex(spotIndex);
      return getReferenceOffsets(null, this.panel.current, targetEl);
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
      spotStyle =
        spotShape === 'rect'
          ? createRectSvgStyle(spotOffset)
          : createCircleSvgStyle(spotOffset);
    }

    const wasMounted = Boolean(this.spot.current);
    const panelContentProps = {
      title,
      message,
      totalSize: this.series.size,
      currentIndex: this.spotIndex,
      goPrev: this.series.hasKindnessByIndex(spotIndex - 1)
        ? this.goPrev
        : null,
      goNext: this.series.hasKindnessByIndex(spotIndex + 1)
        ? this.goNext
        : null,
      goIndex: this.goIndex,
      skip: this.skip,
      transitionEmitter: this.transitionEmitter,
    };

    return ReactDOM.createPortal(
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
                  <feGaussianBlur
                    in="SourceGraphic"
                    stdDeviation={BLUR_STD_DEVIATION}
                  />
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
                <rect className={overlayClassName} mask="url(#spot)" />
              </svg>
              <div ref={this.panel} className={panelClassName}>
                {children(panelContentProps)}
              </div>
            </div>
          </React.Fragment>
        )}
      </CSSTransition>,
      global.document.body,
    );
  }
}

KindnessPanel.defaultProps = {
  initialIndex: 0,
  shape: 'circle',
  seriesId: 'default',
  // eslint-disable-next-line react/display-name
  children: panelContentProps => (
    <KindnessPanelContent {...panelContentProps} />
  ),
  onClickOutside: () => {},
};

function insideViewport(data) {
  const { popper } = data.offsets;
  const { width, height } = popper;
  let { top, right, bottom, left } = popper;
  const scrollTop = getScroll(global.document.documentElement, 'top');
  const scrollLeft = getScroll(global.document.documentElement, 'left');
  const viewportWidth = global.document.documentElement.clientWidth;
  const viewportHeight = global.document.documentElement.clientHeight;
  const viewportRight = scrollLeft + viewportWidth;
  const viewportBottom = scrollTop + viewportHeight;

  if (popper.top < scrollTop) {
    top = scrollTop;
    bottom = top + height;
  } else if (popper.bottom > viewportBottom) {
    top = viewportBottom - height;
    bottom = viewportBottom;
  }
  if (popper.left < scrollLeft) {
    left = scrollLeft;
    right = left + width;
  } else if (popper.right > viewportRight) {
    left = viewportRight - width;
    right = viewportRight;
  }
  return {
    ...data,
    offsets: {
      ...data.offsets,
      popper: {
        ...popper,
        top,
        right,
        bottom,
        left,
      },
    },
  };
}

function scrollViewport(axis, spotShape, spotOffset) {
  const offsetProp = axis === 'x' ? 'left' : 'top';
  const sizeProp = axis === 'x' ? 'width' : 'height';
  const edgeProp = axis === 'x' ? 'right' : 'bottom';
  const horizontal = axis === 'x';
  const scrollSize = getScroll(global.document.documentElement, offsetProp);
  const viewportSize =
    axis === 'x'
      ? global.document.documentElement.clientWidth
      : global.document.documentElement.clientHeight;

  let offsetSize;
  let spotEdge;

  if (spotShape === 'rect') {
    offsetSize = spotOffset[offsetProp];
    spotEdge = spotOffset[edgeProp];
  } else {
    const circleOffset = createCircleSvgStyle(spotOffset);
    offsetSize = circleOffset[axis];
    spotEdge = offsetSize + circleOffset[sizeProp];
  }

  if (scrollSize + viewportSize < spotEdge) {
    animateScrollTo(Math.max(spotEdge - viewportSize, 0), {
      horizontal,
      offset: SCROLL_OFFSET,
    });
  } else if (offsetSize < scrollSize) {
    animateScrollTo(Math.max(offsetSize, 0), {
      horizontal,
      offset: -SCROLL_OFFSET,
    });
  }
}

function createCircleSvgStyle(popperOffset) {
  const wc = popperOffset.width / 2;
  const hc = popperOffset.height / 2;
  // const rad = wc + (SPOT_MARGIN * 2);
  const cx = popperOffset.left + wc;
  const cy = popperOffset.top + hc;
  const r =
    Math.max((popperOffset.width + popperOffset.height) / 4, SPOT_MIN_RADIUS) +
    SPOT_MARGIN;
  return {
    x: cx - r,
    y: cy - r,
    rx: r,
    ry: r,
    width: r * 2,
    height: r * 2,
  };
}

function createRectSvgStyle(popperOffset) {
  return {
    x: popperOffset.left - SPOT_MARGIN,
    y: popperOffset.top - SPOT_MARGIN,
    width: popperOffset.width + SPOT_MARGIN * 2,
    height: popperOffset.height + SPOT_MARGIN * 2,
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
