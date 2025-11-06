import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Base URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:6060';

// Custom metrics
export const errorRate = new Rate('errors');
export const successRate = new Rate('success_rate');
export const reqDuration = new Trend('request_duration', true);
export const totalRequests = new Counter('total_requests');

// Options
const TESTING_CAPACITY = 300

export const options = {
  scenarios: {
    capacity_test: {
      executor: 'ramping-vus',
      startVUs: TESTING_CAPACITY / 2,
      gracefulStop: '20s',
      stages: [{ duration: '15s', target: TESTING_CAPACITY },
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
    const endpoints = [
      { method: 'GET', url: '/api/v1/category/get-category' },
      { method: 'GET', url: '/api/v1/product/product-list/1' },
      { method: 'GET', url: '/api/v1/product/product-count' },
      { method: 'GET', url: '/api/v1/product/product-photo/66db427fdb0119d9234b27f9' },
      { method: 'GET', url: '/api/v1/product/product-photo/67a2171ea6d9e00ef2ac0229' },
      { method: 'GET', url: '/api/v1/product/product-photo/66db427fdb0119d9234b27f5' },
      { method: 'GET', url: '/api/v1/product/product-photo/66db427fdb0119d9234b27f1' },

      { method: 'SLEEP', duration: '1s' },

      { method: 'POST', url: '/api/v1/product/product-filters', body: JSON.stringify({ checked: ["66db427fdb0119d9234b27ef"], radio: [] }), headers: { 'Content-Type': 'application/json' } },
      
      { method: 'SLEEP', duration: '1s' },
      
      { method: 'POST', url: '/api/v1/product/product-filters', body: JSON.stringify({ checked: ["66db427fdb0119d923b427ef", "66db427fdb0119d9234b27ed"], radio: [] }), headers: { 'Content-Type': 'application/json' } },
      
      { method: 'SLEEP', duration: '1s' },
      
      { method: 'POST', url: '/api/v1/product/product-filters', body: JSON.stringify({ checked: ["66db427fdb0119d9234b27ef", "66db427fdb0119d9234b27ed"], radio: [80, 99] }), headers: { 'Content-Type': 'application/json' } },
      
      { method: 'SLEEP', duration: '1s' },

      { method: 'GET', url: '/api/v1/product/product-list/2' },

      { method: 'SLEEP', duration: '1s' },

      { method: 'GET', url: '/api/v1/category/get-category' },
      { method: 'GET', url: '/api/v1/product/product-list/1' },
      { method: 'GET', url: '/api/v1/product/product-count' },
      { method: 'GET', url: '/api/v1/product/product-photo/66db427fdb0119d9234b27f9' },
      { method: 'GET', url: '/api/v1/product/product-photo/67a2171ea6d9e00ef2ac0229' },
      { method: 'GET', url: '/api/v1/product/product-photo/66db427fdb0119d9234b27f5' },
      { method: 'GET', url: '/api/v1/product/product-photo/66db427fdb0119d9234b27f1' },

      { method: 'SLEEP', duration: '1s' },
      
      { method: 'GET', url: '/api/v1/product/get-product/the-law-of-contract-in-singapore' },
      { method: 'GET', url: '/api/v1/product/related-product/67a2171ea6d9e00ef2ac0229/66db427fdb0119d9234b27ef' },

      { method: 'SLEEP', duration: '1s' },

      { method: 'GET', url: '/api/v1/product/get-product/novel' },
      { method: 'GET', url: '/api/v1/product/related-product/66db427fdb0119d9234b27f9/66db427fdb0119d9234b27ef' },

      { method: 'SLEEP', duration: '1s' },

      { method: 'GET', url: '/api/v1/product/search/Smartphone' },
    ];

    for (const ep of endpoints) {
      if (ep.method === 'SLEEP') {
        sleep(ep.duration ? parseFloat(ep.duration) : 1);
        continue;
      }
      const res =
        ep.method === 'POST'
          ? http.post(`${BASE_URL}${ep.url}`, ep.body, { headers: ep.headers })
          : http.get(`${BASE_URL}${ep.url}`);

      // console.log(`Requested ${res.url} - Status: ${res.status}`);
      // totalRequests.add(1);
      reqDuration.add(res.timings.duration);
      // successRate.add(res.status === 200 || res.status === 304);
      // errorRate.add(res.status >= 400);

      check(res, {
        [`${ep.method} ${ep.url} success`]: (r) => r.status === 200 || r.status === 304,
      });
      // sleep for a randomised short duration between requests
      // sleep(Math.random() * 100);
    }

    errorRate.add(0);
  } catch (error) {
    console.error(`Error during API test: ${error.message}`);
    errorRate.add(1);
  } finally {
    sleep(1);
  }
}
