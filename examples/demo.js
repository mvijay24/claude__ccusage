import { getAllLogs, aggregateByDay, calculateCost } from '../index.js';

// Example: Get usage for last 7 days programmatically
async function demo() {
  console.log('Fetching Claude Code usage data...\n');
  
  try {
    const logs = await getAllLogs();
    
    if (logs.length === 0) {
      console.log('No usage data found. Make sure Claude Code has been used.');
      return;
    }
    
    const dailyStats = aggregateByDay(logs);
    const last7Days = dailyStats.slice(-7);
    
    console.log('Last 7 days usage:');
    console.log('==================');
    
    let totalCost = 0;
    
    last7Days.forEach(day => {
      console.log(`\n${day.date}:`);
      console.log(`  Requests: ${day.requests}`);
      console.log(`  Cost: $${day.cost.toFixed(2)}`);
      console.log(`  Projects: ${day.projects.join(', ')}`);
      totalCost += day.cost;
    });
    
    console.log('\n==================');
    console.log(`Total Cost (7 days): $${totalCost.toFixed(2)}`);
    console.log(`Daily Average: $${(totalCost / 7).toFixed(2)}`);
    console.log(`Projected Monthly: $${(totalCost / 7 * 30).toFixed(2)}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

demo();