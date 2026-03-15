const { SNSClient, CreateTopicCommand, SubscribeCommand } = require('@aws-sdk/client-sns');
const { CloudWatchClient, PutMetricAlarmCommand, DescribeAlarmsCommand } = require('@aws-sdk/client-cloudwatch');
const { logError, logInfo } = require('../utils/logger');

const region = process.env.AWS_REGION || 'us-east-1';
const snsClient = new SNSClient({ region });
const cwClient = new CloudWatchClient({ region });

async function setupAlerts(instanceId, emailAddress) {
  try {
    // 1. Create SNS Topic
    const topicParams = {
      Name: 'CloudMonitorTopic-' + instanceId
    };
    const createTopicCmd = new CreateTopicCommand(topicParams);
    const topicResponse = await snsClient.send(createTopicCmd);
    const topicArn = topicResponse.TopicArn;
    logInfo(`Created SNS Topic: ${topicArn}`, 'setupAlerts');

    // Subscribe Email if provided
    if (emailAddress) {
      const subscribeParams = {
        Protocol: 'email',
        TopicArn: topicArn,
        Endpoint: emailAddress
      };
      const subscribeCmd = new SubscribeCommand(subscribeParams);
      await snsClient.send(subscribeCmd);
      logInfo(`Subscribed ${emailAddress} to SNS Topic`, 'setupAlerts');
    }
    
    // 2. Create CloudWatch Metric Alarm
    const alarmName = `HighCPUAlarm-${instanceId}`;
    const alarmParams = {
      AlarmName: alarmName,
      ComparisonOperator: 'GreaterThanThreshold',
      EvaluationPeriods: 1, // evaluate across 1 period for faster testing
      MetricName: 'CPUUtilization',
      Namespace: 'AWS/EC2',
      Period: 300,
      Statistic: 'Average',
      Threshold: 80.0,
      ActionsEnabled: true,
      AlarmActions: [topicArn],
      AlarmDescription: 'Alarm when CPU exceeds 80%',
      Dimensions: [
        {
          Name: 'InstanceId',
          Value: instanceId
        }
      ],
      Unit: 'Percent'
    };

    const putAlarmCmd = new PutMetricAlarmCommand(alarmParams);
    await cwClient.send(putAlarmCmd);
    logInfo(`Created CloudWatch Alarm: ${alarmName} linked to ${topicArn}`, 'setupAlerts');

    return { topicArn, alarmName };
  } catch (error) {
    logError(error, 'setupAlerts');
    return null;
  }
}

async function getAlarmStatus(alarmName) {
  if (!alarmName) return null;
  try {
    const cmd = new DescribeAlarmsCommand({
      AlarmNames: [alarmName]
    });
    const res = await cwClient.send(cmd);
    if (res.MetricAlarms && res.MetricAlarms.length > 0) {
      return res.MetricAlarms[0].StateValue;
    }
    return 'UNKNOWN';
  } catch (e) {
    logError(e, 'getAlarmStatus');
    return 'ERROR';
  }
}

module.exports = {
  setupAlerts,
  getAlarmStatus
};
