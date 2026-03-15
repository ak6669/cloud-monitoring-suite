const { EC2Client, RunInstancesCommand, DescribeInstanceStatusCommand, DescribeInstancesCommand, CreateDefaultVpcCommand } = require('@aws-sdk/client-ec2');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const { logError, logInfo } = require('../utils/logger');

const region = process.env.AWS_REGION || 'us-east-1';
const ec2Client = new EC2Client({ region });
const ssmClient = new SSMClient({ region });

async function getLatestAmazonLinuxAmi() {
  try {
    const command = new GetParameterCommand({
      Name: '/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64'
    });
    const response = await ssmClient.send(command);
    return response.Parameter.Value;
  } catch (error) {
    logError(error, 'getLatestAmazonLinuxAmi');
    return null;
  }
}

async function launchInstance(isRetry = false) {
  try {
    const amiId = await getLatestAmazonLinuxAmi();
    if (!amiId) throw new Error('Could not fetch AMI ID from SSM Parameter Store.');

    const params = {
      ImageId: amiId,
      InstanceType: 't3.micro',
      MinCount: 1,
      MaxCount: 1,
      TagSpecifications: [
        {
          ResourceType: 'instance',
          Tags: [
            { Key: 'Name', Value: 'CloudMonitorInstance' },
            { Key: 'Project', Value: 'CloudMonitorSuite' }
          ]
        }
      ]
    };
    
    const command = new RunInstancesCommand(params);
    const response = await ec2Client.send(command);
    
    const instanceId = response.Instances[0].InstanceId;
    logInfo(`Successfully launched EC2 instance: ${instanceId}`, 'launchInstance');
    return instanceId;
  } catch (error) {
    if (error.name === 'VPCIdNotSpecified' && !isRetry) {
      logInfo('No Default VPC detected. Auto-creating a Default VPC now...', 'launchInstance');
      try {
        const createVpcCmd = new CreateDefaultVpcCommand({});
        const vpcRes = await ec2Client.send(createVpcCmd);
        logInfo(`Successfully created Default VPC: ${vpcRes.Vpc.VpcId}. Retrying instance launch...`, 'launchInstance');
        // Wait a few seconds for the VPC to be fully available
        await new Promise(resolve => setTimeout(resolve, 5000));
        return await launchInstance(true); // Retry once
      } catch (vpcError) {
        logError(vpcError, 'launchInstance:CreateDefaultVpc');
        return null;
      }
    }
    
    logError(error, 'launchInstance');
    return null;
  }
}

async function checkInstanceHealth(instanceIds) {
  if (!instanceIds || instanceIds.length === 0) return [];
  try {
    const command = new DescribeInstanceStatusCommand({
      InstanceIds: instanceIds,
      IncludeAllInstances: true
    });
    const response = await ec2Client.send(command);
    return response.InstanceStatuses;
  } catch (error) {
    logError(error, 'checkInstanceHealth');
    return [];
  }
}

async function fetchRunningInstances() {
  try {
    const command = new DescribeInstancesCommand({
      Filters: [
        { Name: 'instance-state-name', Values: ['running', 'pending'] },
        { Name: 'tag:Project', Values: ['CloudMonitorSuite'] }
      ]
    });
    const response = await ec2Client.send(command);
    const instances = [];
    if (response.Reservations) {
      for (const reservation of response.Reservations) {
        if (reservation.Instances) {
          for (const inst of reservation.Instances) {
            instances.push({
              InstanceId: inst.InstanceId,
              State: inst.State.Name,
              PublicIpAddress: inst.PublicIpAddress,
              PrivateIpAddress: inst.PrivateIpAddress
            });
          }
        }
      }
    }
    return instances;
  } catch (error) {
    logError(error, 'fetchRunningInstances');
    return [];
  }
}

module.exports = {
  launchInstance,
  checkInstanceHealth,
  fetchRunningInstances
};
