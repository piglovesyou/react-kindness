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
    // TODO: Better way
    // Wait for the panel positioning
    setTimeout(() => {
      this.nextRef.current.focus();
    }, 200);
  }

  render() {
    const {
      title,
      message,
      totalSize,
      currentIndex,
      onGoPrevClick,
      onGoNextClick,
      onGoIndexClick,
      onSkipClick,
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
                onClick={() => onGoIndexClick(i)}
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
            onGoNextClick && (
              <button type="button" onClick={onSkipClick}>
                Skip
              </button>
            )
          }

          <span className={`${panelClassName}__spacer`}>
            {''}
          </span>
          <button
            type="button"
            onClick={onGoPrevClick}
            {...(onGoPrevClick ? {} : { disabled: true })}
          >
            Prev
          </button>
          {
            onGoNextClick ? (
              <button type="button" onClick={onGoNextClick} ref={this.nextRef}>
                Next
              </button>
            ) : (
              <button type="button" onClick={onSkipClick} ref={this.nextRef}>
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
