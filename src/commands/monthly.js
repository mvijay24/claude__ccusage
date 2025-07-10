import Table from 'cli-table3';
import chalk from 'chalk';
import ora from 'ora';
import { getAllLogs, aggregateByMonth } from '../logParser.js';

export async function monthly() {
  const spinner = ora('Fetching monthly usage data...').start();
  
  try {
    const logs = await getAllLogs();
    
    if (logs.length === 0) {
      spinner.fail('No usage data found');
      console.log(chalk.yellow('\nMake sure Claude Code is installed and has been used.'));
      return;
    }
    
    const monthlyStats = aggregateByMonth(logs);
    spinner.succeed('Monthly data loaded');
    
    // Create monthly table
    const table = new Table({
      head: [
        'Month',
        'Input Tokens',
        'Output Tokens', 
        'Cache Tokens',
        'Total Tokens',
        'Cost ($)',
        'Requests',
        'Projects'
      ],
      style: {
        head: ['cyan']
      }
    });
    
    let totalCost = 0;
    let totalTokens = 0;
    
    monthlyStats.forEach(month => {
      const cacheTokens = month.tokens.cache_read + month.tokens.cache_write;
      const allTokens = month.tokens.input + month.tokens.output + cacheTokens;
      
      table.push([
        month.month,
        formatNumber(month.tokens.input),
        formatNumber(month.tokens.output),
        formatNumber(cacheTokens),
        formatNumber(allTokens),
        chalk.yellow(`$${month.cost.toFixed(2)}`),
        month.requests,
        month.projects.length
      ]);
      
      totalCost += month.cost;
      totalTokens += allTokens;
    });
    
    console.log('\n' + chalk.bold('Monthly Usage Report'));
    console.log(table.toString());
    
    // Current month details
    const currentMonth = new Date().toISOString().substring(0, 7);
    const currentMonthData = monthlyStats.find(m => m.month === currentMonth);
    
    if (currentMonthData) {
      console.log('\n' + chalk.bold('Current Month (' + currentMonth + '):'));
      console.log(`  Total Cost: ${chalk.yellow('$' + currentMonthData.cost.toFixed(2))}`);
      console.log(`  Requests: ${currentMonthData.requests}`);
      console.log(`  Projects: ${currentMonthData.projects.length}`);
      
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const daysPassed = new Date().getDate();
      const projectedCost = (currentMonthData.cost / daysPassed) * daysInMonth;
      
      console.log(`  Projected Monthly: ${chalk.yellow('$' + projectedCost.toFixed(2))}`);
    }
    
    // Show last 3 months comparison if available
    if (monthlyStats.length >= 2) {
      const comparisonTable = new Table({
        head: ['Metric', ...monthlyStats.slice(-3).map(m => m.month)],
        style: { head: ['cyan'] }
      });
      
      comparisonTable.push([
        'Cost',
        ...monthlyStats.slice(-3).map(m => `$${m.cost.toFixed(2)}`)
      ]);
      
      comparisonTable.push([
        'Tokens (M)',
        ...monthlyStats.slice(-3).map(m => {
          const total = m.tokens.input + m.tokens.output + m.tokens.cache_read + m.tokens.cache_write;
          return (total / 1_000_000).toFixed(2) + 'M';
        })
      ]);
      
      console.log('\n' + chalk.bold('Recent Months Comparison'));
      console.log(comparisonTable.toString());
    }
    
  } catch (error) {
    spinner.fail('Error loading monthly data');
    console.error(error);
  }
}

function formatNumber(num) {
  return num.toLocaleString();
}