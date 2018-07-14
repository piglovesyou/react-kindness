(wip) Still developing.

# react-kindness [![Build Status](https://travis-ci.org/piglovesyou/react-kindness.svg?branch=master)](https://travis-ci.org/piglovesyou/react-kindness)

A lightweight, fully-customizable kindly screen guide for React

![mini demo](./resources/demo.gif)

[Demo](https://piglovesyou.github.io/react-kindness/)

To install,

```js
$ npm install --save react-kindness
```

Put this somewhere in your component tree,

```js
import {KindnessPanel, Kindness} from 'react-kindness';
import 'react-kindness/dist/index.css';

// ...
    <KindnessPanel enabled={true}
                     onExit={() => this.setState({showKindness: false})} />
```

then point out some elements that you want your guests to focus on

```js
<Kindness>
    <input type="text" {...} />
</Kindness>

<Kindness>
    <button type="submit">
        Submit
    </button>
</Kindness>
```

When the `<KindnessPanel>`'s `enabled` becomes `true`, the tutorial starts.

## Props of `<KindnessPanel>`

```js
type KindnessPanelProps = {|
  enabled: boolean,
  onExit: Function,
  spotType?: 'circle' | 'rect', // 'circle' by default
  initialIndex?: number,        // 0 by default
  children?: mixed,
  seriesId?: SeriesId,          // 'default' by default
|};
```


## Props of `<Kindness>`

```js
type KindnessProps = {|
  children: mixed,
  order?: number | 'auto',      // 'auto' by default
  seriesId?: SeriesId,          // 'default' by default
|}
```

## (wip) Get additional variables from `<Kindness />`

When you pass a function to `<Kindness />` as a child, you can use additional variables.

```js
<Kindness>
  {(focused) => {
    return (
      <div style={focused && {fontWeight: 'bold'}}>yeah</div>
    );
  }}
</Kindness>
```


## (wip) Customizing a panel content

By default `<KindnessPanel />` uses `<KindnessPanelContent/>` internally. By passing a function as a child, you can customize the content 

```js
<KindnessPanel enabled={true}>
    {
        ({total, currentIndex, goNext, goPrevious, goIndex, finish}) => (
            <div>
                <h3>This is {stage} item</h3>
                <button onClick={goPrev}>Go previous</button>
                <button onClick={goNext}>Go next</button>
            </div>
        )
    }
</KindnessPanel>
```

## Todo

- [x] When scrolling a spot is something wrong
- [x] How can I put all into a single root dom
- [x] Jump to a target with [animated-scroll-to](https://www.npmjs.com/package/animated-scroll-to)
- [x] Why my popper doesn't flip on viewport boundary
- [ ] 0.3.0 Fancy API for customising
- [ ] 0.4.0 More tests

## License

MIT
