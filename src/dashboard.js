const blessed = require('blessed');
const contrib = require('blessed-contrib');

function initDashboard(handlers) {
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Cloud Monitoring Suite'
  });

  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  // 1. Instances Table (Top Left)
  const instancesTable = grid.set(0, 0, 4, 8, contrib.table, {
    keys: true,
    fg: 'white',
    selectedFg: 'white',
    selectedBg: 'blue',
    interactive: false,
    label: 'EC2 Instances Health',
    width: '100%',
    height: '100%',
    border: { type: 'line', fg: 'cyan' },
    columnSpacing: 3,
    columnWidth: [22, 12, 15, 15]
  });

  // 2. Alarm Status (Top Right)
  const alarmLog = grid.set(0, 8, 4, 4, contrib.log, {
    fg: 'green',
    selectedFg: 'green',
    label: 'Alarm Log',
    border: { type: 'line', fg: 'yellow' }
  });

  // 3. CPU Chart (Middle)
  const cpuLine = grid.set(4, 0, 4, 12, contrib.line, {
    style: { line: 'yellow', text: 'green', baseline: 'black' },
    xLabelPadding: 3,
    xPadding: 5,
    showLegend: true,
    wholeNumbersOnly: false,
    label: 'CPU Utilization (%) - Last 1 Hour',
    border: { type: 'line', fg: 'cyan' }
  });

  // 4. Action Log / Error Log (Bottom)
  const actionLog = grid.set(8, 0, 4, 12, contrib.log, {
    fg: 'white',
    selectedFg: 'white',
    label: 'Action Log (Press P to Provision, Q to Quit)',
    border: { type: 'line', fg: 'cyan' }
  });

  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    if (handlers.onQuit) handlers.onQuit();
    return process.exit(0);
  });

  screen.key(['p', 'P'], function(ch, key) {
    if (handlers.onProvision) handlers.onProvision();
  });

  screen.render();

  return {
    screen,
    instancesTable,
    alarmLog,
    cpuLine,
    actionLog
  };
}

module.exports = { initDashboard };
