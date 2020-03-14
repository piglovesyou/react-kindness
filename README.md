# react-kindness [![Node CI](https://github.com/piglovesyou/react-kindness/workflows/Node%20CI/badge.svg)](https://github.com/piglovesyou/react-kindness/actions)

A lightweight, fully-customizable kind screen guide for React

![mini demo](./resources/demo.gif)

[👉 Demo](https://piglovesyou.github.io/react-kindness/)

[👉 Concept](https://dev.to/takamura_so/react-kindness-a-customizable-screen-guide-for-react--3nn0)

To install

```bash
$ npm install --save react-kindness
```

Put this somewhere in your component tree,

```typescript jsx
import {KindnessPanel, Kindness} from 'react-kindness';
import 'react-kindness/dist/index.css';

// ...
    <KindnessPanel enabled={this.state.show}
                   onExit={() => this.setState({show: false})} />
```

then point out some elements that you want your guests to focus on

```typescript jsx
<Kindness>
    <input type="text" {...} />
</Kindness>

<Kindness message="Click here to submit your post!">
    <button type="submit">Submit</button>
</Kindness>
```

When the `<KindnessPanel />` becomes `enabled={true}`, the screen guide starts.

## Props of `<KindnessPanel />`

```typescript jsx
type KindnessPanelProps = {
  enabled: boolean,
  onExit: () => void,
  shape?: 'circle' | 'rect',  // 'circle' by default
  initialIndex?: number,      // 0 by default
  children?: (args: KindnessPanelContentArgs) => React.Component,
                              // <KindnessPanelContent /> by default
                              // Useful if you're customize panel content
  seriesId?: string,          // 'default' by default
                              // Useful if you're having multiple
                              // series of tutorial
  onClickOutside?: (e: MouseEvent) => void | boolean,
                              // () => {} by default
                              // If false was returned, react-kindness
                              // stops event propagation
};
```


## Props of `<Kindness />`

```typescript jsx
type KindnessProps = {
  children: ReactNode,        // Required
  shape?: 'circle' | 'rect',  // By default it's what panel says. Able to override it
  title?: ReactNode,          // null by default
  message?: ReactNode,        // null by default
  order?: number | 'auto',    // 'auto' by default. Affect to steps order
  seriesId?: SeriesId,        // 'default' by default
}
```

## Customizing a panel content

By default `<KindnessPanel />` uses `<KindnessPanelContent />` internally. By passing a function as a child, you can customize the content.

```typescript jsx
type KindnessPanelContentArgs = {
  title: ReactNode;
  message: ReactNode;
  totalSize: number;
  currentIndex: number;
  goPrev: () => void;
  goNext: () => void;
  skip: () => void;
  goIndex: (number) => void;
  transitionEmitter: EventEmitter;
};

<KindnessPanel enabled={true}>
    {
        ({totalSize, currentIndex, goPrev, goNext}: KindnessPanelContentArgs) => (
            <div>
                <h3>{`This is ${currentIndex + 1} of ${totalSize} item.`}</h3>
                <button onClick={goPrev}>Go previous</button>
                <button onClick={goNext}>Go next</button>
            </div>
        )
    }
</KindnessPanel>
```

Properties of the argument is these:

## (TODO) Get additional variables from `<Kindness />`

When you pass a function to `<Kindness />` as a child, you can use additional variables.

```typescript jsx
<Kindness>
    { (focused) => <div style={focused && {fontWeight: 'bold'}}>yeah</div> }
</Kindness>
```

## Todo

- [x] When scrolling a spot is something wrong
- [x] How can I put all into a single root dom
- [x] Jump to a target with [animated-scroll-to](https://www.npmjs.com/package/animated-scroll-to)
- [x] Why my popper doesn't flip on viewport boundary
- [x] 0.3.0 Fancy API for customising
- [x] 0.4.0 More tests
- [x] Scroll X
- [x] `onClickOutside` of `<KindnessPanel />`
- [x] Disabling user interactions `onClickOutside`
- [x] feat: `<Kindness shape={'circle'|'rect'} />` with smooth spot transition of each
- [x] mod: Scroll to a target with decent margin even with circle spot
- [x] 0.5.0 TypeScript implementation
- [ ] Accept a function as a child to `<Kindness />`

## License

MIT
