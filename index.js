const { launchInstance, checkInstanceHealth, fetchRunningInstances } = require('./src/aws/ec2');
const { getMetrics } = require('./src/aws/cloudwatch');
const { setupAlerts, getAlarmStatus } = require('./src/aws/sns');
const { initDashboard } = require('./src/dashboard');
const { logError, logInfo } = require('./src/utils/logger');

let monitoredInstanceId = null;
let alarmName = null;
let ui;

function renderLog(msg) {
  logInfo(msg, 'Dashboard');
  if (ui && ui.actionLog) ui.actionLog.log(msg);
}

function renderAlarmLog(msg) {
  logInfo(msg, 'Alarm');
  if (ui && ui.alarmLog) ui.alarmLog.log(msg);
}

async function handleProvision() {
  if (monitoredInstanceId) {
    renderLog('Instance is already being monitored: ' + monitoredInstanceId);
    return;
  }
  
  renderLog('Provisioning new t3.micro instance...');
  try {
    const id = await launchInstance();
    if (id) {
      monitoredInstanceId = id;
      renderLog('Launched ' + id);
      renderLog('Setting up Alerting...');
      const alertSetup = await setupAlerts(id, process.env.ALERT_EMAIL || null);
      if (alertSetup) {
        alarmName = alertSetup.alarmName;
        renderLog('Alerts configured: ' + alarmName + ', Topic: ' + alertSetup.topicArn);
      }
    }
  } catch (error) {
    renderLog('Error provisioning: ' + error.message);
  }
}

async function refreshData() {
  try {
    // 1. Fetch instances and Health
    const instances = await fetchRunningInstances();
    const instanceIds = instances.map(i => i.InstanceId);
    
    // Auto-attach to the first one if we don't have one monitored
    if (!monitoredInstanceId && instanceIds.length > 0) {
      monitoredInstanceId = instanceIds[0];
      alarmName = `HighCPUAlarm-${monitoredInstanceId}`;
      renderLog(`Auto-attached to existing instance: ${monitoredInstanceId}`);
    }

    const healthData = await checkInstanceHealth(instanceIds);
    
    const tableData = { headers: ['Instance ID', 'State', 'System Health', 'Inst Health'], data: [] };
    
    // Merge
    instances.forEach(inst => {
      const h = healthData.find(hd => hd.InstanceId === inst.InstanceId);
      const sysStatus = h ? h.SystemStatus.Status : 'initializing';
      const instStatus = h ? h.InstanceStatus.Status : 'initializing';
      
      // Auto-flag health failures
      if (sysStatus === 'impaired' || instStatus === 'impaired') {
        renderAlarmLog(`WARN: Health check failing for ${inst.InstanceId}`);
      }

      tableData.data.push([
        inst.InstanceId,
        inst.State,
        sysStatus,
        instStatus
      ]);
    });
    
    if (ui && ui.instancesTable) {
        ui.instancesTable.setData(tableData);
    }

    // 2. Fetch Metrics for the monitored instance
    if (monitoredInstanceId) {
      const metrics = await getMetrics(monitoredInstanceId);
      if (metrics && metrics.cpu && metrics.cpu.timestamps && metrics.cpu.timestamps.length > 0) {
        const title = `CPU Utilization (${monitoredInstanceId})`;
        
        // Formatter for blessed-contrib line dates
        const cpuT = [...metrics.cpu.timestamps].reverse().map(d => {
            return `${d.getHours()}:${d.getMinutes()}`;
        });
        const cpuV = [...metrics.cpu.values].reverse();

        if (ui && ui.cpuLine) {
          ui.cpuLine.setData([{
            title,
            x: cpuT,
            y: cpuV
          }]);
        }
      }
    }

    // 3. Fetch Alarm status
    if (alarmName) {
      const status = await getAlarmStatus(alarmName);
      if (ui && ui.alarmLog) {
        renderAlarmLog(`Alarm [${alarmName}] -> ${status}`);
      }
    }
    
    if (ui && ui.screen) ui.screen.render();
  } catch (error) {
    renderLog('Error refreshing data: ' + error.message);
  }
}

async function main() {
  ui = initDashboard({
    onProvision: handleProvision,
    onQuit: () => {
      renderLog('Quitting dashboard...');
    }
  });

  renderLog('Dashboard started. Fetching initial data...');
  
  // Initial fetch
  await refreshData();
  
  // Poll every 15 seconds
  setInterval(refreshData, 15000);
}

// Global error handlers
process.on('uncaughtException', (err) => {
  logError(err, 'UncaughtException');
  if (ui && ui.screen) ui.screen.destroy();
  console.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(reason, 'UnhandledRejection');
});

main();
