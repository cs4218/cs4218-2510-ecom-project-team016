import http from 'k6/http';
import { sleep } from 'k6';
import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";

export const options = {
  thresholds: {
    http_req_duration: [
      'p(75)<2000', // 75th percentile < 2s
      'p(90)<4000', // 90th percentile < 4s
    ],
    // Based on failed checks or explicit errors you count
    'checks': ['rate<0.001'], // error rate < 0.1%
  },
  vus: 100,
  duration: '30s',
};


export default function() {
  let res = http.get('http://localhost:3000');
  expect.soft(res.status).toBe(200);
  sleep(1);
}
