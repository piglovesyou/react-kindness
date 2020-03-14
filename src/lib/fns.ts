import { getScroll } from 'popper.js/dist/popper-utils';
import animateScrollTo from 'animated-scroll-to';
import { SPOT_MIN_RADIUS, SPOT_MARGIN, SCROLL_OFFSET } from './const';

export function createCircleSvgStyle(popperOffset) {
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

export function createRectSvgStyle(popperOffset) {
  return {
    x: popperOffset.left - SPOT_MARGIN,
    y: popperOffset.top - SPOT_MARGIN,
    width: popperOffset.width + SPOT_MARGIN * 2,
    height: popperOffset.height + SPOT_MARGIN * 2,
  };
}

export function createOverlayStyle() {
  const d = window.document.documentElement;
  const b = window.document.body;
  return {
    width: Math.max(d.clientWidth, d.offsetWidth, b.scrollWidth),
    height: Math.max(d.clientHeight, d.offsetHeight, b.scrollHeight),
  };
}

export function scrollViewport(axis, spotShape, spotOffset) {
  const offsetProp = axis === 'x' ? 'left' : 'top';
  const sizeProp = axis === 'x' ? 'width' : 'height';
  const edgeProp = axis === 'x' ? 'right' : 'bottom';
  const horizontal = axis === 'x';
  const scrollSize = getScroll(window.document.documentElement, offsetProp);
  const viewportSize =
    axis === 'x'
      ? window.document.documentElement.clientWidth
      : window.document.documentElement.clientHeight;

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

export function insideViewport(data) {
  const { popper } = data.offsets;
  const { width, height } = popper;
  let { top, right, bottom, left } = popper;
  const scrollTop = getScroll(window.document.documentElement, 'top');
  const scrollLeft = getScroll(window.document.documentElement, 'left');
  const viewportWidth = window.document.documentElement.clientWidth;
  const viewportHeight = window.document.documentElement.clientHeight;
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
