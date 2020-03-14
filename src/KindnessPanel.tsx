import React, { ReactChildren } from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';
import Popper from 'popper.js';
import { getReferenceOffsets } from 'popper.js/dist/popper-utils';

import debounce from 'lodash.debounce';
import { EventEmitter } from 'events';
import { BLUR_STD_DEVIATION, OVERLAY_TRANSITION_DELAY } from './lib/const';

import { Series, seriesPool } from './series';
import {
  svgClassName,
  overlayClassName,
  panelClassName,
  rootClassName,
  spotClassName,
} from './classNames';
import KindnessPanelContent from './KindnessPanelContent';
import {
  createOverlayStyle,
  scrollViewport,
  createRectSvgStyle,
  createCircleSvgStyle,
  insideViewport,
} from './lib/fns';
import { SpotShapes } from './types';

type KindnessPanelProps = {
  initialIndex: number;
  shape: SpotShapes;
  seriesId: string;
  enabled: boolean;
  onClickOutside?: any;
  onExit: any;
  children: () => ReactChildren;
};

type KindnessPanelState = {
  spotOffset: number | null;
  overlayStyle: any;
};

export default class KindnessPanel extends React.Component<
  KindnessPanelProps,
  KindnessPanelState
> {
  spotIndex = -1;
  series: Series;
  isViewportEventObserved = false;
  panel: HTMLDivElement | null = null; // React.Ref<HTMLDivElement>;
  spot: SVGRectElement | null = null; // React.Ref<SVGRectElement>;
  svg: SVGElement | null = null; // React.Ref<SVGElement>;
  popper: Popper | null = null;
  transitionEmitter: EventEmitter = new EventEmitter();
  onWindowResize: () => void;

  static defaultProps = {
    enabled: false,
    initialIndex: 0,
    shape: 'circle',
    seriesId: 'default',
    // eslint-disable-next-line react/display-name
    children: panelContentProps => (
      <KindnessPanelContent {...panelContentProps} />
    ),
  };

  constructor(props) {
    super(props);

    this.series = seriesPool.getOrCreate(props.seriesId);
    this.state = {
      spotOffset: null,
      overlayStyle: {},
    };

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
    if (!window.document) return;
    this.disposeListeners();
  }

  onDocumentClick = e => {
    const { enabled, onClickOutside } = this.props;
    if (!enabled) return;
    if (!this.panel) return;
    if (!this.series.hasKindnessByIndex(this.spotIndex)) return;
    const kEl = this.series.getKindnessElementByIndex(this.spotIndex);
    if (this.panel.contains(e.target) || kEl.contains(e.target)) return;
    const rv = onClickOutside && onClickOutside(e);

    if (rv === false) {
      // Block the user interaction
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (!this.svg) return;
      const handler = () => {
        setTimeout(() => {
          this.svg!.style.pointerEvents = '';
          document.removeEventListener('mouseup', handler);
        });
      };
      document.addEventListener('mouseup', handler);
      this.svg.style.pointerEvents = 'auto';
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

    if (newIndex >= 0 && this.svg && this.spot && spotOffset) {
      const k = this.series.getKindnessByIndex(this.spotIndex);
      if (!k) throw new Error('boom');
      const { shape: shapeSpecific } = k.props;
      const { shape: shapeBase } = this.props;
      scrollViewport(shapeSpecific || shapeBase, spotOffset);
    }
  }

  forceUpdateOverlaySVG() {
    // At least Chrome often fails drawing overlay rect after window resize
    if (!this.svg) return;
    const old = this.svg.getAttribute('width');
    this.svg.setAttribute('width', '200%');
    setTimeout(() => {
      if (!this.svg) return;
      this.svg.setAttribute('width', old!);
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
      this.popper = new Popper(targetEl, this.panel, {
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
      window.addEventListener('resize', this.onWindowResize);
      window.document.addEventListener('mousedown', this.onDocumentClick, true);
      this.isViewportEventObserved = true;
    }
  }

  disposeListeners() {
    if (this.popper) {
      this.popper.destroy();
      this.popper = null;
    }
    if (this.isViewportEventObserved) {
      window.removeEventListener('resize', this.onWindowResize);
      window.document.removeEventListener(
        'mousedown',
        this.onDocumentClick,
        true,
      );
      this.isViewportEventObserved = false;
    }
  }

  createSpotOffset(spotIndex) {
    if (this.panel && this.spot && this.series.hasKindnessByIndex(spotIndex)) {
      const targetEl = this.series.getKindnessElementByIndex(spotIndex);
      return getReferenceOffsets(null, this.panel, targetEl);
    }
    return null;
  }

  render() {
    if (!window.document) return null;
    const { enabled, shape: spotShapeBase, children } = this.props;
    const { spotOffset, overlayStyle } = this.state;
    const k = this.series.getKindnessByIndex(this.spotIndex);
    // @ts-ignore
    const { shape: spotShapeSpecific, title, message } = k ? k.props : {};
    const { spotIndex } = this;
    const spotShape = spotShapeSpecific || spotShapeBase;

    let spotStyle;
    if (spotOffset) {
      spotStyle =
        spotShape === 'rect'
          ? createRectSvgStyle(spotOffset)
          : createCircleSvgStyle(spotOffset);
    }

    const wasMounted = Boolean(this.panel);
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

    // @ts-ignore
    const panelContent = children(panelContentProps);

    return ReactDOM.createPortal(
      <CSSTransition
        in={wasMounted && enabled}
        timeout={OVERLAY_TRANSITION_DELAY}
        classNames={rootClassName}
        onEntered={() => this.transitionEmitter.emit('onEntered')}
        onExited={this.onOverlayDisapeared}
      >
        <div>
          <svg
            ref={e => (this.svg = e)}
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
                  ref={e => (this.spot = e)}
                  fill="black"
                  filter="url(#blurFilter)"
                  {...(spotOffset ? spotStyle : null)}
                />
              </g>
            </mask>
            <rect className={overlayClassName} mask="url(#spot)" />
          </svg>
          <div ref={e => (this.panel = e)} className={panelClassName}>
            {panelContent}
          </div>
        </div>
      </CSSTransition>,
      window.document.body,
    );
  }
}
