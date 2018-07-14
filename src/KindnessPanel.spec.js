import puppeteer from 'puppeteer';
import assert, { deepStrictEqual } from 'assert';
import { launchApp } from './testUtils';
// import log from 'why-is-node-running';

describe('<KindnessPanel />', function describe() {
  const timeout = 1000 * 60;
  this.timeout(timeout);
  let server;
  let browser;
  let page;

  before(async () => {
    server = await launchApp();
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    page = await browser.newPage();
    await page.goto('http://localhost:3000', { timeout });
  });

  after(async () => {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
    // log(); // TODO: care all processes
  });

  it('positions a spot in a viewport', async () => {
    const {
      type, cx, cy, r,
    } = await page.$eval('.react-kindness__spot', el => ({
      type: el.nodeName,
      cx: Math.floor(Number(el.getAttribute('cx'))),
      cy: Math.floor(Number(el.getAttribute('cy'))),
      r: Math.floor(Number(el.getAttribute('r'))),
    }));
    deepStrictEqual(type, 'circle');
    assert(100 < cx && cx < 200);
    assert(400 < cy && cy < 600);
    deepStrictEqual(r, 56);
  });
});
