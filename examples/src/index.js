import React from 'react';
import { render } from 'react-dom';
import { Kindness, KindnessPanel } from '../../src';
import './style.css';
import '../../src/index.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showKindness: true,
    };
  }

  render() {
    const { showKindness } = this.state;
    return (
      <React.Fragment>

        <KindnessPanel
          enabled={showKindness}
          onExit={() => this.setState({ showKindness: false })}
          // onClickOutside={() => false}
        />

        <header className="page-header" role="banner">
          <h1 className="project-name">
            <Kindness
              order={0}
              title="Hi!"
              message="react-kindness helps guests to give eyes on specific UI parts in a screen."
            >
              <span>
react-kindness
              </span>
            </Kindness>
            {' '}
DEMO
          </h1>
          <h2 className="project-tagline">
A lightweight, fully-customizable kind screen guide for React
          </h2>

          <Kindness
            order={10}
            message="To stop this, click here."
          >
            <button
              type="button"
              className="btn"
              onClick={() => this.setState({ showKindness: !showKindness })}
            >
              {!showKindness ? 'Start kindness' : 'Stop kindness'}
            </button>
          </Kindness>
          <Kindness
            order={30}
            message="Please refer to README for the further information😄"
          >
            <a
              href="https://github.com/piglovesyou/react-kindness"
              className="btn"
            >
README
            </a>
          </Kindness>

        </header>

        <main id="content" className="main-content" role="main">
          <p>
Text can be
            <strong>
bold
            </strong>
,
            <em>
italic
            </em>
, or
            <del>
strikethrough
            </del>
.
          </p>

          <p>
            <a href="#">
Link to another page
            </a>
.
          </p>

          <p>
There should be whitespace between paragraphs.
          </p>

          <p>
There should be whitespace between paragraphs.
We recommend including a README, or a file with information about your project.
          </p>

          <Kindness
            order={15}
            shape="rect"
            message=" Look at the smooth spot transition❤️"
          >
            <h1 id="header-1">
Header 1
            </h1>
          </Kindness>

          <p>
This is a normal paragraph following a header.
GitHub is a code hosting platform for version control and
collaboration. It lets you and others work together on projects from anywhere.
          </p>

          <h2 id="header-2">
Header 2
          </h2>

          <blockquote>
            <p>
This is a blockquote following a header.
            </p>

            <p>
When something is important enough, you do it even if the odds are not in your favor.
            </p>
          </blockquote>

          <h3 id="header-3">
Header 3
          </h3>

          <h4 id="header-4">
Header 4
          </h4>

          <ul>
            <li>
This is an unordered list following a header.
            </li>
            <li>
This is an unordered list following a header.
            </li>
            <li>
This is an unordered list following a header.
            </li>
          </ul>

          <h5 id="header-5">
Header 5
          </h5>

          <ol>
            <li>
This is an ordered list following a header.
            </li>
            <li>
This is an ordered list following a header.
            </li>
            <li>
This is an ordered list following a header.
            </li>
          </ol>

          <h6 id="header-6">
Header 6
          </h6>

          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>
head1
                </th>
                <th style={{ textAlign: 'left' }}>
head two
                </th>
                <th style={{ textAlign: 'left' }}>
three
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ textAlign: 'left' }}>
ok
                </td>
                <td style={{ textAlign: 'left' }}>
good swedish fish
                </td>
                <td style={{ textAlign: 'left' }}>
nice
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left' }}>
out of stock
                </td>
                <td style={{ textAlign: 'left' }}>
good and plenty
                </td>
                <td style={{ textAlign: 'left' }}>
nice
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left' }}>
ok
                </td>
                <td style={{ textAlign: 'left' }}>
good
                  <code className="highlighter-rouge">
oreos
                  </code>
                </td>
                <td style={{ textAlign: 'left' }}>
hmm
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'left' }}>
ok
                </td>
                <td style={{ textAlign: 'left' }}>
good
                  <code className="highlighter-rouge">
zoute
                  </code>
                  {' '}
drop
                </td>
                <td style={{ textAlign: 'left' }}>
yumm
                </td>
              </tr>
            </tbody>
          </table>

          <h3 id="theres-a-horizontal-rule-below-this">
There’s a horizontal rule below this.
          </h3>

          <hr />

          <h3 id="here-is-an-unordered-list">
Here is an unordered list:
          </h3>

          <ul>
            <li>
Item foo
            </li>
            <li>
Item bar
            </li>
            <li>
Item baz
            </li>
            <li>
Item zip
            </li>
          </ul>

          <h3 id="and-an-ordered-list">
And an ordered list:
          </h3>

          <ol>
            <li>
Item one
            </li>
            <li>
Item two
            </li>
            <li>
Item three
            </li>
            <li>
Item four
            </li>
          </ol>

          <h3 id="and-a-nested-list">
And a nested list:
          </h3>

          <ul>
            <li>
level 1 item
              <ul>
                <li>
level 2 item
                </li>
                <li>
level 2 item
                  <ul>
                    <li>
level 3 item
                    </li>
                    <li>
level 3 item
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
            <li>
level 1 item
              <ul>
                <li>
level 2 item
                </li>
                <li>
level 2 item
                </li>
                <li>
level 2 item
                </li>
              </ul>
            </li>
            <li>
level 1 item
              <ul>
                <li>
level 2 item
                </li>
                <li>
level 2 item
                </li>
              </ul>
            </li>
            <li>
level 1 item
            </li>
          </ul>

          <h3 id="small-image">
Small image
          </h3>

          <p>
            <Kindness
              order={20}
              message="Scrolling also works fine. Go jump and focus anywhere on the page💨"
            >
              <img src="https://assets-cdn.github.com/images/icons/emoji/octocat.png" alt="Octocat" />
            </Kindness>
          </p>

          <h3 id="large-image">
Large image
          </h3>

          <p>
            <img src="https://guides.github.com/activities/hello-world/branching.png" alt="Branching" />
          </p>

          <h3 id="definition-lists-can-be-used-with-html-syntax">
Definition lists can be used with HTML syntax.
          </h3>

          <dl>
            <dt>
Name
            </dt>
            <dd>
Godzilla
            </dd>
            <dt>
Born
            </dt>
            <dd>
1952
            </dd>
            <dt>
Birthplace
            </dt>
            <dd>
Japan
            </dd>
            <dt>
Color
            </dt>
            <dd>
Green
            </dd>
          </dl>

          <div className="highlighter-rouge">
            <div className="highlight">
              <pre className="highlight">
                <code>
The final element.
                </code>
              </pre>
            </div>
          </div>


          <footer className="site-footer">

            <span className="site-footer-owner">
              <a href="https://github.com/pages-themes/cayman">
cayman
              </a>
              {' '}
is maintained by
              {' '}
              <a
                href="https://github.com/pages-themes"
              >
pages-themes
              </a>
.
            </span>

            <span className="site-footer-credits">
This page was generated by
              <a href="https://pages.github.com">
GitHub Pages
              </a>
.
            </span>
          </footer>
        </main>
      </React.Fragment>
    );
  }
}

render(<App />, document.getElementById('root'));
