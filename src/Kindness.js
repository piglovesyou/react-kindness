import React from 'react';

import { seriesPool } from './series';

export default class Kindness extends React.Component {
  constructor(props) {
    if (!props.seriesId) throw new Error('never');
    super(props);
    this.series = seriesPool.getOrCreate(props.seriesId);
    this.ref = React.createRef();
    this.orderKey = null;
  }

  componentDidMount() {
    const { order } = this.props;
    if (order === 'auto') {
      this.orderKey = this.series.append(this);
    } else {
      this.series.set(order, this);
      this.orderKey = order;
    }
  }

  componentWillUnmount() {
    if (typeof this.orderKey !== 'number') throw new Error('never');
    this.series.delete(this.orderKey);
  }

  series ;

  orderKey ;

  ref ;

  render() {
    const { children } = this.props;
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      ref: this.ref,
    });
  }
}

Kindness.defaultProps = {
  shape: null,
  order: 'auto',
  seriesId: 'default',
  title: null,
  message: null,
};
