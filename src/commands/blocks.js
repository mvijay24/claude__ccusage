import Table from 'cli-table3';
import chalk from 'chalk';
import ora from 'ora';
import { getAllLogs, aggregateByBlock } from '../logParser.js';

export async function blocks(options) {
  if (options.live) {
    return liveBlockMonitoring();
  }
  
  const spinner = ora('Fetching block usage data...').start();
  
  try {
    const logs = await getAllLogs();
    
    if (logs.length === 0) {
      spinner.fail('No usage data found');
      console.log(chalk.yellow('\nMake sure Claude Code is installed and has been used.'));
      return;
    }
    
    const blocks = aggregateByBlock(logs);
    const recentBlocks = blocks.slice(-10); // Show last 10 blocks
    
    spinner.succeed('Block data loaded');
    
    // Create blocks table
    const table = new Table({
      head: [
        'Block #',
        'Start Time',
        'Duration (hrs)',
        'Tokens',
        'Cost ($)',
        'Requests',
        'Status'
      ],
      style: {
        head: ['cyan']
      }
    });
    
    recentBlocks.forEach((block, index) => {
      const totalTokens = block.tokens.input + block.tokens.output + 
                         block.tokens.cache_read + block.tokens.cache_write;
      
      table.push([
        blocks.indexOf(block) + 1,
        formatTime(block.startTime),
        block.duration.toFixed(2),
        formatNumber(totalTokens),
        chalk.yellow(`$${block.cost.toFixed(2)}`),
        block.requests,
        block.isActive ? chalk.green('ACTIVE') : chalk.gray('Closed')
      ]);
    });
    
    console.log('\n' + chalk.bold('5-Hour Usage Blocks'));
    console.log(table.toString());
    
    // Show active block details if any
    const activeBlock = blocks.find(b => b.isActive);
    if (activeBlock) {
      console.log('\n' + chalk.bold('Active Block Details:'));
      console.log(`  Started: ${formatTime(activeBlock.startTime)}`);
      console.log(`  Duration: ${activeBlock.duration.toFixed(2)} hours`);
      console.log(`  Current Cost: ${chalk.yellow('$' + activeBlock.cost.toFixed(2))}`);
      console.log(`  Burn Rate: ${chalk.yellow('$' + (activeBlock.cost / activeBlock.duration).toFixed(2) + '/hour')}`);
      
      const remainingTime = 5 - activeBlock.duration;
      const projectedCost = activeBlock.cost + (activeBlock.cost / activeBlock.duration) * remainingTime;
      console.log(`  Projected Block Cost: ${chalk.yellow('$' + projectedCost.toFixed(2))}`);
    }
    
  } catch (error) {
    spinner.fail('Error loading block data');
    console.error(error);
  }
}

async function liveBlockMonitoring() {
  console.clear();
  console.log(chalk.bold.cyan('Live Block Monitoring'));
  console.log(chalk.gray('Press Ctrl+C to exit\n'));
  
  const updateInterval = setInterval(async () => {
    try {
      const logs = await getAllLogs();
      const blocks = aggregateByBlock(logs);
      const activeBlock = blocks.find(b => b.isActive);
      
      console.clear();
      console.log(chalk.bold.cyan('Live Block Monitoring'));
      console.log(chalk.gray('Press Ctrl+C to exit\n'));
      
      if (activeBlock) {
        const totalTokens = activeBlock.tokens.input + activeBlock.tokens.output + 
                           activeBlock.tokens.cache_read + activeBlock.tokens.cache_write;
        
        // Create live stats table
        const table = new Table({
          style: { head: ['cyan'] }
        });
        
        table.push(
          [chalk.bold('Started'), formatTime(activeBlock.startTime)],
          [chalk.bold('Duration'), `${activeBlock.duration.toFixed(2)} hours`],
          [chalk.bold('Tokens'), formatNumber(totalTokens)],
          [chalk.bold('Requests'), activeBlock.requests],
          [chalk.bold('Projects'), activeBlock.projects.length],
          [chalk.bold('Current Cost'), chalk.yellow(`$${activeBlock.cost.toFixed(2)}`)],
          [chalk.bold('Burn Rate'), chalk.yellow(`$${(activeBlock.cost / activeBlock.duration).toFixed(2)}/hour`)]
        );
        
        console.log(table.toString());
        
        // Progress bar
        const progress = (activeBlock.duration / 5) * 100;
        const progressBar = createProgressBar(progress);
        console.log('\n' + chalk.bold('Block Progress:'));
        console.log(progressBar);
        
        // Projections
        const remainingTime = 5 - activeBlock.duration;
        const projectedCost = activeBlock.cost + (activeBlock.cost / activeBlock.duration) * remainingTime;
        
        console.log('\n' + chalk.bold('Projections:'));
        console.log(`  Remaining Time: ${remainingTime.toFixed(2)} hours`);
        console.log(`  Projected Block Cost: ${chalk.yellow('$' + projectedCost.toFixed(2))}`);
        
      } else {
        console.log(chalk.yellow('No active block at the moment.'));
        console.log(chalk.gray('Start using Claude Code to begin a new block.'));
      }
      
    } catch (error) {
      console.error('Error updating live data:', error);
    }
  }, 5000); // Update every 5 seconds
  
  // Handle exit
  process.on('SIGINT', () => {
    clearInterval(updateInterval);
    console.log('\n\nExiting live monitoring...');
    process.exit(0);
  });
}

function formatTime(date) {
  return date.toLocaleString();
}

function formatNumber(num) {
  return num.toLocaleString();
}

function createProgressBar(percentage) {
  const width = 40;
  const filled = Math.floor((percentage / 100) * width);
  const empty = width - filled;
  
  const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  const percentText = `${percentage.toFixed(1)}%`;
  
  return `[${bar}] ${percentText}`;
}