import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const consumerLag = new Trend('consumer_lag');
const processingRate = new Rate('consumer_processing_rate');

export const options = {
    scenarios: {
        consumer_monitoring: {
            executor: 'constant-vus',
            vus: 1,
            duration: '22m',
        },
    },
};

export default function () {
    // Query Prometheus for consumer lag
    const lagResponse = http.get('http://localhost:9090/api/v1/query?query=kafka_consumergroup_lag');

    if (lagResponse.status === 200) {
        const data = JSON.parse(lagResponse.body);
        if (data.data && data.data.result) {
            data.data.result.forEach(result => {
                const lag = parseFloat(result.value[1]);
                consumerLag.add(lag);

                // Check if lag is acceptable
                check(lag, {
                    'consumer lag < 1000': (l) => l < 1000,
                    'consumer lag < 5000': (l) => l < 5000,
                });
            });
        }
    }

    // Query processing rate
    const rateResponse = http.get('http://localhost:9090/api/v1/query?query=rate(event_consumed_total[1m])');

    if (rateResponse.status === 200) {
        const data = JSON.parse(rateResponse.body);
        if (data.data && data.data.result) {
            data.data.result.forEach(result => {
                const rate = parseFloat(result.value[1]);
                processingRate.add(rate > 0);
            });
        }
    }

    sleep(10); // Check every 10 seconds
}
