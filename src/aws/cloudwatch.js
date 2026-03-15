const { CloudWatchClient, GetMetricDataCommand } = require('@aws-sdk/client-cloudwatch');
const { logError, logInfo } = require('../utils/logger');

const region = process.env.AWS_REGION || 'us-east-1';
const cwClient = new CloudWatchClient({ region });

async function getMetrics(instanceId) {
  if (!instanceId) return null;
  
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // 1 hour ago
  
  try {
    const params = {
      StartTime: startTime,
      EndTime: endTime,
      MetricDataQueries: [
        {
          Id: 'cpu',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: 'CPUUtilization',
              Dimensions: [{ Name: 'InstanceId', Value: instanceId }]
            },
            Period: 300,
            Stat: 'Average',
          },
          ReturnData: true
        },
        {
          Id: 'diskRead',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: 'DiskReadBytes',
              Dimensions: [{ Name: 'InstanceId', Value: instanceId }]
            },
            Period: 300,
            Stat: 'Sum',
          },
          ReturnData: true
        },
        {
          Id: 'diskWrite',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: 'DiskWriteBytes',
              Dimensions: [{ Name: 'InstanceId', Value: instanceId }]
            },
            Period: 300,
            Stat: 'Sum',
          },
          ReturnData: true
        },
        {
          Id: 'networkIn',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: 'NetworkIn',
              Dimensions: [{ Name: 'InstanceId', Value: instanceId }]
            },
            Period: 300,
            Stat: 'Sum',
          },
          ReturnData: true
        },
        {
          Id: 'networkOut',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: 'NetworkOut',
              Dimensions: [{ Name: 'InstanceId', Value: instanceId }]
            },
            Period: 300,
            Stat: 'Sum',
          },
          ReturnData: true
        }
      ]
    };

    const command = new GetMetricDataCommand(params);
    const response = await cwClient.send(command);
    
    const results = {};
    if (response.MetricDataResults) {
      for (const result of response.MetricDataResults) {
        results[result.Id] = {
          timestamps: result.Timestamps,
          values: result.Values
        };
      }
    }
    return results;
  } catch (error) {
    logError(error, 'getMetrics');
    return null;
  }
}

module.exports = {
  getMetrics
};
