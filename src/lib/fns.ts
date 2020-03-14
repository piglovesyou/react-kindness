import { getScroll } from 'popper.js/dist/popper-utils';
import animateScrollTo from 'animated-scroll-to';
import { SpotShapes } from '../types';
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

export function scrollViewport(spotShape: SpotShapes, spotOffset) {
  const scrollTop = getScroll(window.document.documentElement, 'top');
  const scrollLeft = getScroll(window.document.documentElement, 'left');

  const viewportHeight = window.document.documentElement.clientHeight;
  const viewportWidth = window.document.documentElement.clientWidth;

  let y: number | null = null;
  let verticalOffset = 0;
  if (spotOffset.top < scrollTop) {
    y = spotOffset.top;
    verticalOffset = -SCROLL_OFFSET;
  } else if (scrollTop + viewportHeight < spotOffset.bottom - viewportHeight) {
    y = spotOffset.bottom - viewportHeight;
    verticalOffset = SCROLL_OFFSET;
  }

  let x: number | null = null;
  let horizontalOffset = 0;
  if (spotOffset.left < scrollLeft) {
    x = spotOffset.left;
    horizontalOffset = -SCROLL_OFFSET;
  } else if (scrollLeft + viewportWidth < spotOffset.right - viewportWidth) {
    x = spotOffset.right - viewportWidth;
    horizontalOffset = SCROLL_OFFSET;
  }

  animateScrollTo([x, y], { verticalOffset, horizontalOffset });
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
