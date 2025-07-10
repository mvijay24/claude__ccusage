import Table from 'cli-table3';
import chalk from 'chalk';
import ora from 'ora';
import { getAllLogs, aggregateByProject } from '../logParser.js';

export async function session() {
  const spinner = ora('Fetching session data...').start();
  
  try {
    const logs = await getAllLogs();
    
    if (logs.length === 0) {
      spinner.fail('No usage data found');
      console.log(chalk.yellow('\nMake sure Claude Code is installed and has been used.'));
      return;
    }
    
    const projectStats = aggregateByProject(logs);
    spinner.succeed('Session data loaded');
    
    // Sort by cost descending
    projectStats.sort((a, b) => b.cost - a.cost);
    
    // Create projects table
    const table = new Table({
      head: [
        'Project',
        'Input Tokens',
        'Output Tokens',
        'Cache Tokens', 
        'Total Tokens',
        'Cost ($)',
        'Requests',
        'First Seen',
        'Last Active'
      ],
      style: {
        head: ['cyan']
      }
    });
    
    let totalCost = 0;
    let totalRequests = 0;
    
    projectStats.forEach(project => {
      const cacheTokens = project.tokens.cache_read + project.tokens.cache_write;
      const totalTokens = project.tokens.input + project.tokens.output + cacheTokens;
      
      // Truncate long project names
      const projectName = project.project.length > 30 
        ? project.project.substring(0, 27) + '...'
        : project.project;
      
      table.push([
        projectName,
        formatNumber(project.tokens.input),
        formatNumber(project.tokens.output),
        formatNumber(cacheTokens),
        formatNumber(totalTokens),
        chalk.yellow(`$${project.cost.toFixed(2)}`),
        project.requests,
        formatDate(project.firstSeen),
        formatDate(project.lastSeen)
      ]);
      
      totalCost += project.cost;
      totalRequests += project.requests;
    });
    
    console.log('\n' + chalk.bold('Project/Session Usage Report'));
    console.log(table.toString());
    
    // Summary statistics
    console.log('\n' + chalk.bold('Summary:'));
    console.log(`  Total Projects: ${projectStats.length}`);
    console.log(`  Total Cost: ${chalk.yellow('$' + totalCost.toFixed(2))}`);
    console.log(`  Total Requests: ${totalRequests}`);
    console.log(`  Average Cost/Project: ${chalk.yellow('$' + (totalCost / projectStats.length).toFixed(2))}`);
    
    // Top 5 most expensive projects
    if (projectStats.length > 5) {
      const topProjects = projectStats.slice(0, 5);
      const topTable = new Table({
        head: ['Rank', 'Project', 'Cost ($)', '% of Total'],
        style: { head: ['cyan'] }
      });
      
      topProjects.forEach((project, index) => {
        const percentage = ((project.cost / totalCost) * 100).toFixed(1);
        const projectName = project.project.length > 40 
          ? project.project.substring(0, 37) + '...'
          : project.project;
        
        topTable.push([
          index + 1,
          projectName,
          chalk.yellow(`$${project.cost.toFixed(2)}`),
          `${percentage}%`
        ]);
      });
      
      console.log('\n' + chalk.bold('Top 5 Most Expensive Projects:'));
      console.log(topTable.toString());
    }
    
    // Cache efficiency by project
    const cacheTable = new Table({
      head: ['Project', 'Cache Efficiency', 'Cache Saved ($)'],
      style: { head: ['cyan'] }
    });
    
    projectStats
      .filter(p => p.tokens.cache_read > 0)
      .sort((a, b) => {
        const effA = a.tokens.cache_read / (a.tokens.input + a.tokens.cache_read);
        const effB = b.tokens.cache_read / (b.tokens.input + b.tokens.cache_read);
        return effB - effA;
      })
      .slice(0, 5)
      .forEach(project => {
        const efficiency = (project.tokens.cache_read / (project.tokens.input + project.tokens.cache_read) * 100).toFixed(1);
        const cacheSavings = project.tokens.cache_read * 0.0000027; // Approximate savings
        const projectName = project.project.length > 40 
          ? project.project.substring(0, 37) + '...'
          : project.project;
        
        cacheTable.push([
          projectName,
          chalk.green(`${efficiency}%`),
          chalk.green(`$${cacheSavings.toFixed(2)}`)
        ]);
      });
    
    if (cacheTable.length > 0) {
      console.log('\n' + chalk.bold('Top Cache Efficiency Projects:'));
      console.log(cacheTable.toString());
    }
    
  } catch (error) {
    spinner.fail('Error loading session data');
    console.error(error);
  }
}

function formatNumber(num) {
  return num.toLocaleString();
}

function formatDate(date) {
  return date.toLocaleDateString();
}