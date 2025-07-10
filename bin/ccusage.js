#!/usr/bin/env node
import { program } from 'commander';
import { daily } from '../src/commands/daily.js';
import { monthly } from '../src/commands/monthly.js';
import { blocks } from '../src/commands/blocks.js';
import { session } from '../src/commands/session.js';

program
  .name('ccusage')
  .description('Track Claude Code usage and costs')
  .version('0.1.0');

program
  .command('daily', { isDefault: true })
  .description('Show daily usage statistics')
  .option('-d, --days <number>', 'Number of days to show', '7')
  .action(daily);

program
  .command('monthly')
  .description('Show monthly usage statistics')
  .action(monthly);

program
  .command('blocks')
  .description('Show 5-hour usage blocks')
  .option('--live', 'Show live block monitoring')
  .action(blocks);

program
  .command('session')
  .description('Show usage by project/session')
  .action(session);

program.parse();