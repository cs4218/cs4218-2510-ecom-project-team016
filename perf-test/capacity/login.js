import { browser } from 'k6/browser';
import { check } from 'k6';
import http from "k6/http";
import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";

const BASE_URL =  __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  scenarios: {
    capacity_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '1m', target: 20 },
        { duration: '1m', target: 30 },
        { duration: '1m', target: 40 },
        { duration: '1m', target: 50 },
      ],
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    'browser_web_vital_lcp{page:home}': ['p(75)<2500', 'p(90)<4000'],       // P75 load ≤ 2.5s (page load metric), P90 load ≤ 4s (page load metric)
    // 'browser_http_req_duration': ['p(95)<800'],              // P95 overall response time
    // 'browser_http_req_duration{page:home}': ['p(75)<400'],   // P75 page-specific latency
    'browser_http_req_failed': ['rate<0.001'],               // < 0.1% failure rate
    'http_reqs': ['rate>10'],                               // Minimum throughput (adjust as needed)
    // Optional: TTFB via custom metric (see below)
  },
};

export function setup() {
  let res = http.get(BASE_URL);
  expect(res.status, `Got unexpected status code ${res.status} when trying to setup. Exiting.`).toBe(200);
}


export default async function () {
  const page = await browser.newPage();

  try {
    const response = await page.goto('http://localhost:3000/login', {
      waitUntil: 'load',
    });

    check(response, {
      'status is 200': (r) => r.status() === 200,
    });

    // Enter Email
    const emailField = page.getByRole('textbox', { name: 'Enter Your Email' });
    await emailField.click();
    await emailField.type('perf@testing.com');

    // Enter Password
    const passwordField = page.getByRole('textbox', { name: 'Enter Your Password' });
    await passwordField.click();
    await passwordField.type('lllll');

    // Click LOGIN button
    const loginButton = page.getByRole('button', { name: 'LOGIN' });
    await loginButton.click();

    await page.waitForLoadState('networkidle');

    // Verify successful login by checking for a specific element on the dashboard
    const dashboardElement = page.getByText('All Products');
    expect(dashboardElement).toBeVisible();
  } catch (error) {
    console.log(error)
    console.error(`Error during login test: ${error.message}`);
  } finally {
    await page.close();
  }
}
