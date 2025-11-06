import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Base URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:6060';

// Custom metrics
export const errorRate = new Rate('errors');
export const successRate = new Rate('success_rate');
export const reqDuration = new Trend('request_duration', true);

// Options
const TESTING_CAPACITY = 1000;

export const options = {
  scenarios: {
    capacity_test: {
      executor: 'ramping-vus',
      startVUs: TESTING_CAPACITY / 2,
      gracefulStop: '20s',
      stages: [
        { duration: '15s', target: TESTING_CAPACITY },
        { duration: '2m', target: TESTING_CAPACITY },
      ],
    },
  },
  thresholds: {
    errors: ['rate<0.05'], // less than 5% errors
    http_req_duration: ['p(75)<2500', 'p(90)<4000'], // 75% under 2.5s, 90% under 4s
  },
};

// Main test
export default function () {
  try {
    // 1️⃣ Login to get token
    const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
      email: 'a@a.sg',
      password: 'lllll',
    }), { headers: { 'Content-Type': 'application/json' } });

    check(loginRes, { 'login success': (r) => r.status === 200 });
    const token = loginRes.json('token') || loginRes.json('data.token'); // adjust based on backend
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': token,
    };

    // 2️⃣ Define endpoints (use token for protected ones)
    const endpoints = [
      { method: 'GET', url: '/api/v1/product/braintree/token' },

      { method: 'SLEEP', duration: '10s' },

      {
        method: 'POST',
        url: '/api/v1/product/braintree/payment',
        body: JSON.stringify({
          nonce: 'tokencc_bj_gr23sy_9p7h4d_qcfgq3_4tjk78_qpy',
          cart: [
            {
              _id: '67a2171ea6d9e00ef2ac0229',
              name: 'The Law of Contract in Singapore',
              slug: 'the-law-of-contract-in-singapore',
              description: 'A bestselling book in Singapore',
              price: 54.99,
              category: '66db427fdb0119d9234b27ef',
              quantity: 200,
              shipping: true,
              createdAt: '2024-09-06T17:57:19.992Z',
              updatedAt: '2024-09-06T17:57:19.992Z',
              __v: 0,
            },
          ],
        }),
        headers: authHeaders,
      },

      { method: 'SLEEP', duration: '1s' },

      { method: 'GET', url: '/api/v1/auth/user-auth', headers: authHeaders },

      { method: 'SLEEP', duration: '1s' },

      { method: 'GET', url: '/api/v1/category/get-category' },
      // { method: 'GET', url: '/api/v1/auth/orders', headers: authHeaders },
      // we remove order fetching to reduce unrealistic load because the orders are counted
      // to the same account, so fetching orders increases in time as orders increase.
      // we want to focus more on the payment api here.
    ];

    // 3️⃣ Execute endpoints
    for (const ep of endpoints) {
      if (ep.method === 'SLEEP') {
        sleep(parseFloat(ep.duration) || 1);
        continue;
      }

      const headers = ep.headers || { 'Content-Type': 'application/json' };
      const res =
        ep.method === 'POST'
          ? http.post(`${BASE_URL}${ep.url}`, ep.body, { headers })
          : http.get(`${BASE_URL}${ep.url}`, { headers });

      reqDuration.add(res.timings.duration);
      check(res, {
        [`${ep.method} ${ep.url} success`]: (r) => r.status === 200 || r.status === 304,
      });
    }

    errorRate.add(0);
  } catch (error) {
    console.error(`Error during API test: ${error.message}`);
    errorRate.add(1);
  } finally {
    sleep(1);
  }
}
