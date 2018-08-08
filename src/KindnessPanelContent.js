// @flow

import React from 'react';
import {
  classnames,
  panelArrowClassName,
  panelClassName,
  panelMessageClassName,
  panelTitleClassName,
} from './classNames';
import { KindnessPanelContentProps } from './types';

export default class KindnessPanelContent extends React.Component<KindnessPanelContentProps> {
  constructor(props: KindnessPanelContentProps) {
    super(props);
    this.nextRef = React.createRef();

    const { transitionEmitter } = props;
    transitionEmitter.on('onEntered', this.onEntered);
  }

  componentWillUnmount() {
    const { transitionEmitter } = this.props;
    transitionEmitter.removeListener('onEntered', this.onEntered);
  }

  onEntered = () => {
    if (!this.nextRef.current) return;
    this.nextRef.current.focus();
  }

  render() {
    const {
      title,
      message,
      totalSize,
      currentIndex,
      goPrev,
      goNext,
      goIndex,
      skip,
    } = this.props;
    return (
      <React.Fragment>
        <div className={`${panelClassName}__content`}>
          {title && (
          <h3 className={panelTitleClassName}>
            {title}
          </h3>
          )}
          {message && (
          <p className={panelMessageClassName}>
            {message}
          </p>
          )}
          <span className={`${panelClassName}__spacer`} />
          <div className={`${panelClassName}__indicator`}>
            {Array.from(Array(totalSize)).map((_, i) => (
              <button
                type="button"
                key={String(i)}
                onClick={() => goIndex(i)}
                className={classnames(`${panelClassName}__indicator__dot`,
                  i === currentIndex ? `${panelClassName}__indicator__dot--current` : null)}
              >
                {''}
              </button>
            ))}
          </div>
        </div>
        <div className={`${panelClassName}__bottombar`}>
          {
            goNext && (
              <button type="button" onClick={skip}>
                Skip
              </button>
            )
          }

          <span className={`${panelClassName}__spacer`}>
            {''}
          </span>
          <button
            type="button"
            onClick={goPrev}
            {...(goPrev ? {} : { disabled: true })}
          >
            Prev
          </button>
          {
            goNext ? (
              <button type="button" onClick={goNext} ref={this.nextRef}>
                Next
              </button>
            ) : (
              <button type="button" onClick={skip} ref={this.nextRef}>
                Done
              </button>
            )
          }
        </div>
        <span
          className={panelArrowClassName}
          x-arrow="true"
        >
          {' '}
        </span>
      </React.Fragment>
    );
  }
}
