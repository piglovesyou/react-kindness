//

export const rootClassName = 'react-kindness';
export const svgClassName = `${rootClassName}__svg`;
export const overlayClassName = `${rootClassName}__overlay`;
export const spotClassName = `${rootClassName}__spot`;
export const panelClassName = `${rootClassName}-panel`;
export const panelArrowClassName = `${rootClassName}-panel__arrow`;
export const panelTitleClassName = `${rootClassName}-panel__title`;
export const panelMessageClassName = `${rootClassName}-panel__message`;

export function classnames(...args) {
  return Object.keys(
    args.reduce((o, c) => {
      if (!c) return o;
      return { ...o, [c]: true };
    }, {}),
  ).join(' ');
}
