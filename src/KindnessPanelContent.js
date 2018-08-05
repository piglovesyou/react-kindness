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
  constructor(props) {
    super(props);
    this.nextRef = React.createRef();
  }

  componentDidMount() {
    // TODO: Better way?
    // Wait for the panel positioning
    setTimeout(() => {
      const { current } = this.nextRef;
      if (current) current.focus();
    }, 200);
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
                  i === currentIndex && `${panelClassName}__indicator__dot--current`)}
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
