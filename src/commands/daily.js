import Table from 'cli-table3';
import chalk from 'chalk';
import ora from 'ora';
import { getAllLogs, aggregateByDay } from '../logParser.js';
import { SUBSCRIPTION_PLANS } from '../pricing.js';

export async function daily(options) {
  const spinner = ora('Fetching usage data...').start();
  
  try {
    const logs = await getAllLogs();
    
    if (logs.length === 0) {
      spinner.fail('No usage data found');
      console.log(chalk.yellow('\nMake sure Claude Code is installed and has been used.'));
      return;
    }
    
    const dailyStats = aggregateByDay(logs);
    const daysToShow = parseInt(options.days) || 7;
    const recentDays = dailyStats.slice(-daysToShow);
    
    spinner.succeed('Usage data loaded');
    
    // Create main usage table
    const table = new Table({
      head: [
        'Date',
        'Input Tokens',
        'Output Tokens',
        'Cache Read',
        'Cache Write',
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
    let totalTokens = {
      input: 0,
      output: 0,
      cache_read: 0,
      cache_write: 0
    };
    
    recentDays.forEach(day => {
      const totalDayTokens = day.tokens.input + day.tokens.output + 
                            day.tokens.cache_read + day.tokens.cache_write;
      
      table.push([
        day.date,
        formatNumber(day.tokens.input),
        formatNumber(day.tokens.output),
        formatNumber(day.tokens.cache_read),
        formatNumber(day.tokens.cache_write),
        formatNumber(totalDayTokens),
        chalk.yellow(`$${day.cost.toFixed(2)}`),
        day.requests,
        day.projects.length
      ]);
      
      totalCost += day.cost;
      totalTokens.input += day.tokens.input;
      totalTokens.output += day.tokens.output;
      totalTokens.cache_read += day.tokens.cache_read;
      totalTokens.cache_write += day.tokens.cache_write;
    });
    
    // Add total row
    table.push([
      chalk.bold('Total'),
      chalk.bold(formatNumber(totalTokens.input)),
      chalk.bold(formatNumber(totalTokens.output)),
      chalk.bold(formatNumber(totalTokens.cache_read)),
      chalk.bold(formatNumber(totalTokens.cache_write)),
      chalk.bold(formatNumber(
        totalTokens.input + totalTokens.output + 
        totalTokens.cache_read + totalTokens.cache_write
      )),
      chalk.bold.yellow(`$${totalCost.toFixed(2)}`),
      '',
      ''
    ]);
    
    console.log('\n' + chalk.bold('Daily Usage Report'));
    console.log(table.toString());
    
    // Show savings table
    const savingsTable = new Table({
      head: ['Plan', 'Monthly Cost', 'Token Value', 'Savings'],
      style: { head: ['cyan'] }
    });
    
    Object.entries(SUBSCRIPTION_PLANS).forEach(([key, plan]) => {
      const monthlyCost = plan.monthly_cost;
      const savings = totalCost - (monthlyCost * daysToShow / 30);
      
      savingsTable.push([
        plan.name,
        `$${monthlyCost}`,
        chalk.yellow(`$${totalCost.toFixed(2)}`),
        savings > 0 ? chalk.green(`$${savings.toFixed(2)}`) : chalk.red(`-$${Math.abs(savings).toFixed(2)}`)
      ]);
    });
    
    console.log('\n' + chalk.bold('Cost Analysis'));
    console.log(savingsTable.toString());
    
    // Cache efficiency
    const cacheEfficiency = totalTokens.cache_read > 0 
      ? ((totalTokens.cache_read / (totalTokens.input + totalTokens.cache_read)) * 100).toFixed(1)
      : 0;
    
    console.log('\n' + chalk.bold('Statistics:'));
    console.log(`  Cache Efficiency: ${chalk.green(cacheEfficiency + '%')}`);
    console.log(`  Average Cost/Day: ${chalk.yellow('$' + (totalCost / daysToShow).toFixed(2))}`);
    console.log(`  Projected Monthly: ${chalk.yellow('$' + (totalCost / daysToShow * 30).toFixed(2))}`);
    
  } catch (error) {
    spinner.fail('Error loading usage data');
    console.error(error);
  }
}

function formatNumber(num) {
  return num.toLocaleString();
}