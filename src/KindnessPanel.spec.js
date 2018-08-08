/* eslint-disable react/no-multi-comp */

import React from 'react';
import assert, { deepStrictEqual } from 'assert';
import './index.css';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Kindness, KindnessPanel } from './index';

Enzyme.configure({ adapter: new Adapter() });

describe('<KindnessPanel />', function describe() {
  this.timeout(30 * 1000);
  let appContainer;
  let mountOpts;
  let app;

  before(async () => {
    appContainer = document.createElement('div');
    appContainer.id = 'root';
    document.body.appendChild(appContainer);
    mountOpts = { attachTo: appContainer };
  });

  afterEach(async () => {
  });

  after(async () => {
    app.unmount();
    document.body.removeChild(appContainer);
  });

  it('shows nothing when no <Kindness />', async () => {
    app = mount((
      <div>
        <KindnessPanel enabled={false} onExit={() => {}} />
      </div>
    ), mountOpts);
    assert(document.querySelector('.react-kindness'));
    deepStrictEqual(getComputedStyle(document.querySelector('.react-kindness__svg')).opacity, '0');

    app.setProps({ enabled: String(true) });
    await timeout(500); // Wait for transition
    assert(document.querySelector('.react-kindness'));
    deepStrictEqual(getComputedStyle(document.querySelector('.react-kindness__svg')).opacity, '0');
  });

  it('shows and hide a panel when <Kindness /> exists', async () => {
    class App extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          showKindness: false,
        };
      }

      render() {
        const { showKindness } = this.state;
        return (
          <React.Fragment>
            <KindnessPanel
              enabled={showKindness}
              onExit={() => { this.setState({ showKindness: false }); }}
            />
            <Kindness>
              <span>
yeah
              </span>
            </Kindness>
          </React.Fragment>
        );
      }
    }
    app = mount(<App />, mountOpts);

    app.setState({ showKindness: true });
    await timeout(500); // Wait for transition
    deepStrictEqual(getComputedStyle(document.querySelector('.react-kindness__svg')).opacity, '1');

    const nextEl = app.find('.react-kindness-panel__bottombar button').last();
    nextEl.simulate('click');
    await timeout(500); // Wait for transition
    deepStrictEqual(getComputedStyle(document.querySelector('.react-kindness__svg')).opacity, '0');
  });

  it('can initially shows on componentDidMount', async () => {
    app = mount((
      <div>
        <KindnessPanel enabled onExit={() => {}} />
        <p>
          <Kindness>
            <span>
yeah
            </span>
          </Kindness>
        </p>
      </div>
    ), mountOpts);
    assert(document.querySelector('.react-kindness'));
    await timeout(500); // Wait for transition
    deepStrictEqual(getComputedStyle(document.querySelector('.react-kindness__svg')).opacity, '1');
  });

  it('follows order of <Kindness /> on click "next"', async () => {
    class App extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          showKindness: false,
        };
      }

      render() {
        const { showKindness } = this.state;
        return (
          <React.Fragment>
            <KindnessPanel
              enabled={showKindness}
              onExit={() => { this.setState({ showKindness: false }); }}
            />
            <p>
              <Kindness message="zero">
                <span>
zero
                </span>
              </Kindness>
            </p>
            <p>
              <Kindness message="two" order={200}>
                <span>
two
                </span>
              </Kindness>
            </p>
            <p>
              <Kindness message="one" order={100}>
                <span>
one
                </span>
              </Kindness>
            </p>
            <p>
              <Kindness message="three">
                <span>
three
                </span>
              </Kindness>
            </p>
            <p>
              <Kindness message="four" order={400}>
                <span>
four
                </span>
              </Kindness>
            </p>
            <p>
              <Kindness message="five">
                <span>
five
                </span>
              </Kindness>
            </p>
          </React.Fragment>
        );
      }
    }
    app = mount(<App />, mountOpts);

    app.setState({ showKindness: true });
    await timeout(500); // Wait for transition
    const nextEl = app.find('.react-kindness-panel__bottombar button').last();
    deepStrictEqual(app.find('.react-kindness-panel__message').text(), 'zero');

    nextEl.simulate('click');
    await timeout(500); // Wait for transition
    deepStrictEqual(app.find('.react-kindness-panel__message').text(), 'one');

    nextEl.simulate('click');
    await timeout(500); // Wait for transition
    deepStrictEqual(app.find('.react-kindness-panel__message').text(), 'two');

    nextEl.simulate('click');
    await timeout(500); // Wait for transition
    deepStrictEqual(app.find('.react-kindness-panel__message').text(), 'three');

    nextEl.simulate('click');
    await timeout(500); // Wait for transition
    deepStrictEqual(app.find('.react-kindness-panel__message').text(), 'four');

    nextEl.simulate('click');
    await timeout(500); // Wait for transition
    deepStrictEqual(app.find('.react-kindness-panel__message').text(), 'five');

    nextEl.simulate('click');
    await timeout(500); // Wait for transition
    deepStrictEqual(getComputedStyle(document.querySelector('.react-kindness__svg')).opacity, '0');
  });

  it('scrolls to the target', async () => {
    app = mount((
      <div>
        <KindnessPanel enabled onExit={() => {}} />
        <header style={{ border: '1px #fcc dashed', height: 2000 }}>
          <p>
            <Kindness order={900}>
              <span>
yeah
              </span>
            </Kindness>
          </p>
          <p>
            <Kindness order={0}>
              <span>
yeah
              </span>
            </Kindness>
          </p>
        </header>
        <main>
          <p>
            <Kindness order={100}>
              <span>
yeah
              </span>
            </Kindness>
          </p>
        </main>
      </div>
    ), mountOpts);
    assert(document.querySelector('.react-kindness'));
    await timeout(500); // Wait for transition
    deepStrictEqual(window.scrollY, 0);
    const nextEl = app.find('.react-kindness-panel__bottombar button').last();

    nextEl.simulate('click');
    await timeout(1000); // Wait for transition
    const lastScrollY = window.scrollY;
    assert(lastScrollY > 0);

    nextEl.simulate('click');
    await timeout(1000); // Wait for transition
    assert(window.scrollY < lastScrollY);
  });
});

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
