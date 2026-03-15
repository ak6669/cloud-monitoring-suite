# Cloud Infrastructure Automation & Monitoring Suite

> A modern, end-to-end AWS infrastructure monitoring console built entirely with Node.js and the AWS SDK v3.

![Header Image](assets/Screenshot%20png%201,2/Screenshot%202026-03-15%20125350.png)

This project replaces heavy web frameworks with a lightning-fast Terminal User Interface (TUI). It automatically provisions AWS EC2 instances, establishes CloudWatch metric streams, and securely configures Simple Notification Service (SNS) threat alerting pipelines.

---

## ⚡ Key Features

- **Automated Server Provisioning**: Dynamically queries the SSM Parameter Store for the latest AL2023 AMIs and auto-provisions `t3.micro` instances.
- **Smart Network Resilience**: Intercepts `VPCIdNotSpecified` errors and leverages SDK logic to gracefully build out a new Default AWS VPC on-the-fly.
- **Proactive Threat Pipelines**: Constructs unique SNS Topics mapping to a programmatic CloudWatch Metric Alarm for CPU Utilization > 80%.
- **Interactive Terminal Dashboard**: Powered by `blessed` & `blessed-contrib` to present a cleanly sectioned Grid Layout displaying Instance states, Action Event Tracking, and a live graph of the 1-Hour CPU Utilization Array.

## 🛠 Tech Stack

- **Core Language**: `Node.js`
- **Cloud Provider**: Amazon Web Services (AWS)
- **SDK**: `@aws-sdk` (v3) modular clients (`@aws-sdk/client-ec2`, `cloudwatch`, `sns`, `ssm`)
- **TUI Framework**: `blessed` & `blessed-contrib`

## 🚀 Quick Start

### Prerequisites
1. Node.js (v18+ recommended)
2. Valid AWS Credentials mapping to an IAM User with sufficient permissions.
3. Configure your environment variables or `~/.aws/credentials`:
```bash
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="your_key"
export AWS_SECRET_ACCESS_KEY="your_secret"
export ALERT_EMAIL="your_email@example.com" # Optional, for SNS subscriptions
```

### Installation
Clone the repository and install the backend modules:
```bash
git clone https://github.com/ak6669/cloud-monitoring-suite.git
cd cloud-monitoring-suite
npm install
```

### Usage
Fire up the dashboard:
```bash
node index.js
```
* **P** - Provision a new `t3.micro` EC2 Instance and its SNS Alert bridge.
* **Q** - Quit the Dashboard.

## 📖 Case Study Documentation
A thoroughly detailed professional Walkthrough and Case Study regarding the engineering metrics for this module can be found within the provided `LinkedIn_Cloud_Monitoring_Project.docx` file.

![Execution Trace](assets/Screenshot%20png%201,2/Screenshot%202026-03-15%20125403.png)
