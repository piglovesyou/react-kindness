import React, {ReactNode} from 'react';
import { seriesPool } from './series';

export type KindnessProps = {
  shape?: null,
  order?: 'auto' | number,
  seriesId?: 'default',
  title?: string,
  message?: string
  children: ReactNode;
};

export default class Kindness extends React.Component<KindnessProps> {
  static defaultProps = {
    seriesId: 'default',
  };

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

  series;

  orderKey;

  ref;

  render() {
    const { children } = this.props;
    const child = React.Children.only(children);
    if (!child || typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') throw new Error('Specify children.');
    return React.cloneElement(child as Exclude<typeof child, {}>, {
      ref: this.ref,
    });
  }
}

// Kindness.defaultProps = {
//   shape: null,
//   order: 'auto',
//   seriesId: 'default',
//   title: null,
//   message: null,
// };
