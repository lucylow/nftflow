#!/usr/bin/env python3
"""
Canary deployment monitoring script
Monitors key metrics during canary deployment and triggers rollback if thresholds are exceeded
"""

import argparse
import time
import requests
import json
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional

class CanaryMonitor:
    def __init__(self, percentage: int, duration: int):
        self.percentage = percentage
        self.duration = duration
        self.start_time = datetime.now()
        self.end_time = self.start_time + timedelta(seconds=duration)
        
        # Metrics thresholds
        self.thresholds = {
            'transaction_failure_rate': 5.0,  # 5%
            'gas_price_spike': 200.0,         # 200%
            'error_rate': 3.0,                # 3%
            'response_time': 2000,            # 2 seconds
            'throughput_drop': 50.0           # 50%
        }
        
        # Metrics storage
        self.metrics = {
            'transaction_failures': 0,
            'total_transactions': 0,
            'gas_prices': [],
            'errors': 0,
            'total_requests': 0,
            'response_times': [],
            'throughput': []
        }
        
        # Baseline metrics (from previous deployment)
        self.baseline = self.load_baseline_metrics()
    
    def load_baseline_metrics(self) -> Dict:
        """Load baseline metrics from previous deployment"""
        try:
            with open('metrics/baseline.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("⚠️  No baseline metrics found, using defaults")
            return {
                'gas_price': 20000000000,  # 20 Gwei
                'throughput': 1000,        # 1000 TPS
                'response_time': 500       # 500ms
            }
    
    def check_transaction_failure_rate(self) -> bool:
        """Check if transaction failure rate exceeds threshold"""
        if self.metrics['total_transactions'] == 0:
            return True
        
        failure_rate = (self.metrics['transaction_failures'] / self.metrics['total_transactions']) * 100
        print(f"📊 Transaction failure rate: {failure_rate:.2f}% (threshold: {self.thresholds['transaction_failure_rate']}%)")
        
        return failure_rate <= self.thresholds['transaction_failure_rate']
    
    def check_gas_price_spike(self) -> bool:
        """Check if gas price has spiked beyond threshold"""
        if not self.metrics['gas_prices']:
            return True
        
        current_gas_price = self.metrics['gas_prices'][-1]
        baseline_gas_price = self.baseline['gas_price']
        
        spike_percentage = ((current_gas_price - baseline_gas_price) / baseline_gas_price) * 100
        print(f"⛽ Gas price spike: {spike_percentage:.2f}% (threshold: {self.thresholds['gas_price_spike']}%)")
        
        return spike_percentage <= self.thresholds['gas_price_spike']
    
    def check_error_rate(self) -> bool:
        """Check if API error rate exceeds threshold"""
        if self.metrics['total_requests'] == 0:
            return True
        
        error_rate = (self.metrics['errors'] / self.metrics['total_requests']) * 100
        print(f"🚨 Error rate: {error_rate:.2f}% (threshold: {self.thresholds['error_rate']}%)")
        
        return error_rate <= self.thresholds['error_rate']
    
    def check_response_time(self) -> bool:
        """Check if response time exceeds threshold"""
        if not self.metrics['response_times']:
            return True
        
        avg_response_time = sum(self.metrics['response_times']) / len(self.metrics['response_times'])
        print(f"⏱️  Average response time: {avg_response_time:.0f}ms (threshold: {self.thresholds['response_time']}ms)")
        
        return avg_response_time <= self.thresholds['response_time']
    
    def check_throughput_drop(self) -> bool:
        """Check if throughput has dropped significantly"""
        if not self.metrics['throughput']:
            return True
        
        current_throughput = self.metrics['throughput'][-1]
        baseline_throughput = self.baseline['throughput']
        
        drop_percentage = ((baseline_throughput - current_throughput) / baseline_throughput) * 100
        print(f"📈 Throughput drop: {drop_percentage:.2f}% (threshold: {self.thresholds['throughput_drop']}%)")
        
        return drop_percentage <= self.thresholds['throughput_drop']
    
    def collect_metrics(self):
        """Collect metrics from various sources"""
        try:
            # Collect from Prometheus
            self.collect_prometheus_metrics()
            
            # Collect from application logs
            self.collect_log_metrics()
            
            # Collect from blockchain
            self.collect_blockchain_metrics()
            
        except Exception as e:
            print(f"❌ Error collecting metrics: {e}")
    
    def collect_prometheus_metrics(self):
        """Collect metrics from Prometheus"""
        try:
            response = requests.get('http://localhost:9090/api/v1/query', params={
                'query': 'rate(http_requests_total[5m])'
            }, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data['status'] == 'success' and data['data']['result']:
                    throughput = float(data['data']['result'][0]['value'][1])
                    self.metrics['throughput'].append(throughput)
                    
        except Exception as e:
            print(f"⚠️  Could not collect Prometheus metrics: {e}")
    
    def collect_log_metrics(self):
        """Collect metrics from application logs"""
        try:
            # This would typically read from log files or log aggregation service
            # For now, we'll simulate some metrics
            import random
            
            # Simulate transaction metrics
            self.metrics['total_transactions'] += random.randint(10, 50)
            if random.random() < 0.02:  # 2% failure rate
                self.metrics['transaction_failures'] += 1
            
            # Simulate request metrics
            self.metrics['total_requests'] += random.randint(100, 500)
            if random.random() < 0.01:  # 1% error rate
                self.metrics['errors'] += 1
            
            # Simulate response times
            response_time = random.randint(200, 800)
            self.metrics['response_times'].append(response_time)
            
        except Exception as e:
            print(f"⚠️  Could not collect log metrics: {e}")
    
    def collect_blockchain_metrics(self):
        """Collect metrics from blockchain"""
        try:
            # This would typically connect to the blockchain and collect gas prices
            # For now, we'll simulate gas price data
            import random
            
            gas_price = random.randint(15000000000, 30000000000)  # 15-30 Gwei
            self.metrics['gas_prices'].append(gas_price)
            
        except Exception as e:
            print(f"⚠️  Could not collect blockchain metrics: {e}")
    
    def trigger_rollback(self):
        """Trigger rollback to previous version"""
        print("🚨 ROLLBACK TRIGGERED!")
        print("📋 Rollback reasons:")
        
        if not self.check_transaction_failure_rate():
            print("  - Transaction failure rate exceeded threshold")
        
        if not self.check_gas_price_spike():
            print("  - Gas price spike detected")
        
        if not self.check_error_rate():
            print("  - Error rate exceeded threshold")
        
        if not self.check_response_time():
            print("  - Response time exceeded threshold")
        
        if not self.check_throughput_drop():
            print("  - Throughput drop detected")
        
        # Here you would implement the actual rollback logic
        # For example, updating load balancer configuration
        print("🔄 Initiating rollback process...")
        
        # Save rollback event
        rollback_event = {
            'timestamp': datetime.now().isoformat(),
            'percentage': self.percentage,
            'duration': self.duration,
            'metrics': self.metrics,
            'reason': 'Threshold exceeded'
        }
        
        with open('metrics/rollback-events.json', 'a') as f:
            f.write(json.dumps(rollback_event) + '\n')
        
        return True
    
    def run_monitoring(self):
        """Run the monitoring loop"""
        print(f"🔍 Starting canary monitoring for {self.percentage}% traffic")
        print(f"⏰ Duration: {self.duration} seconds")
        print(f"📊 Monitoring until: {self.end_time}")
        
        while datetime.now() < self.end_time:
            print(f"\n⏰ {datetime.now().strftime('%H:%M:%S')} - Monitoring cycle")
            
            # Collect metrics
            self.collect_metrics()
            
            # Check all thresholds
            checks = [
                self.check_transaction_failure_rate(),
                self.check_gas_price_spike(),
                self.check_error_rate(),
                self.check_response_time(),
                self.check_throughput_drop()
            ]
            
            # If any check fails, trigger rollback
            if not all(checks):
                return self.trigger_rollback()
            
            print("✅ All metrics within acceptable ranges")
            
            # Wait before next check
            time.sleep(30)
        
        print("🎉 Canary deployment completed successfully!")
        print("📈 All metrics remained within acceptable ranges")
        
        # Save successful deployment metrics
        success_event = {
            'timestamp': datetime.now().isoformat(),
            'percentage': self.percentage,
            'duration': self.duration,
            'metrics': self.metrics,
            'status': 'success'
        }
        
        with open('metrics/successful-deployments.json', 'a') as f:
            f.write(json.dumps(success_event) + '\n')
        
        return False

def main():
    parser = argparse.ArgumentParser(description='Monitor canary deployment')
    parser.add_argument('--percentage', type=int, required=True, help='Traffic percentage')
    parser.add_argument('--duration', type=int, required=True, help='Monitoring duration in seconds')
    
    args = parser.parse_args()
    
    monitor = CanaryMonitor(args.percentage, args.duration)
    
    try:
        rollback_triggered = monitor.run_monitoring()
        sys.exit(1 if rollback_triggered else 0)
    except KeyboardInterrupt:
        print("\n⏹️  Monitoring interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Monitoring failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
