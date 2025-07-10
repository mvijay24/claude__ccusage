import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { globby } from 'globby';
import { calculateCost } from './pricing.js';

export async function getClaudeProjectsPath() {
  const homeDir = os.homedir();
  return path.join(homeDir, '.claude', 'projects');
}

export async function parseLogLine(line) {
  try {
    const entry = JSON.parse(line);
    
    // Look for assistant messages with usage data
    if (entry.type === 'assistant' && entry.message && entry.message.usage) {
      const usage = entry.message.usage;
      const tokens = {
        input: usage.input_tokens || 0,
        output: usage.output_tokens || 0,
        cache_read: usage.cache_read_input_tokens || 0,
        cache_write: usage.cache_creation_input_tokens || 0
      };

      const model = entry.message.model || 'unknown';
      const cost = calculateCost(tokens, model);

      return {
        timestamp: new Date(entry.timestamp),
        type: entry.type,
        model: model,
        tokens,
        cost,
        request_id: entry.requestId || entry.uuid,
        session_id: entry.sessionId,
        project: entry.cwd || 'unknown'
      };
    }
  } catch (e) {
    // Skip invalid lines
  }
  return null;
}

export async function parseLogFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const entries = [];
  for (const line of lines) {
    const entry = await parseLogLine(line);
    if (entry) {
      entries.push(entry);
    }
  }
  
  return entries;
}

export async function getAllLogs() {
  const projectsPath = await getClaudeProjectsPath();
  
  try {
    const logFiles = await globby(['**/*.jsonl'], {
      cwd: projectsPath,
      absolute: true
    });

    const allEntries = [];
    
    for (const logFile of logFiles) {
      const projectDir = path.basename(path.dirname(logFile));
      // Convert project directory name to readable format
      const projectName = projectDir.replace(/-mnt-c-/i, '/mnt/c/')
                                   .replace(/-/g, '/')
                                   .replace(/\/+/g, '/');
      
      const entries = await parseLogFile(logFile);
      
      entries.forEach(entry => {
        // Use cwd from log entry if available, otherwise use extracted project name
        if (entry.project === 'unknown' || !entry.project) {
          entry.project = projectName;
        }
        allEntries.push(entry);
      });
    }
    
    return allEntries.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('Claude projects directory not found. Make sure Claude Code is installed and has been used.');
      return [];
    }
    throw error;
  }
}

export function aggregateByDay(entries) {
  const dailyStats = new Map();
  
  entries.forEach(entry => {
    const dayKey = entry.timestamp.toISOString().split('T')[0];
    
    if (!dailyStats.has(dayKey)) {
      dailyStats.set(dayKey, {
        date: dayKey,
        tokens: { input: 0, output: 0, cache_read: 0, cache_write: 0 },
        cost: 0,
        requests: 0,
        projects: new Set()
      });
    }
    
    const stats = dailyStats.get(dayKey);
    stats.tokens.input += entry.tokens.input;
    stats.tokens.output += entry.tokens.output;
    stats.tokens.cache_read += entry.tokens.cache_read;
    stats.tokens.cache_write += entry.tokens.cache_write;
    stats.cost += entry.cost;
    stats.requests += 1;
    stats.projects.add(entry.project);
  });
  
  return Array.from(dailyStats.values()).map(stats => ({
    ...stats,
    projects: Array.from(stats.projects)
  }));
}

export function aggregateByMonth(entries) {
  const monthlyStats = new Map();
  
  entries.forEach(entry => {
    const monthKey = entry.timestamp.toISOString().substring(0, 7);
    
    if (!monthlyStats.has(monthKey)) {
      monthlyStats.set(monthKey, {
        month: monthKey,
        tokens: { input: 0, output: 0, cache_read: 0, cache_write: 0 },
        cost: 0,
        requests: 0,
        projects: new Set()
      });
    }
    
    const stats = monthlyStats.get(monthKey);
    stats.tokens.input += entry.tokens.input;
    stats.tokens.output += entry.tokens.output;
    stats.tokens.cache_read += entry.tokens.cache_read;
    stats.tokens.cache_write += entry.tokens.cache_write;
    stats.cost += entry.cost;
    stats.requests += 1;
    stats.projects.add(entry.project);
  });
  
  return Array.from(monthlyStats.values()).map(stats => ({
    ...stats,
    projects: Array.from(stats.projects)
  }));
}

export function aggregateByBlock(entries) {
  const blocks = [];
  const BLOCK_DURATION = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
  
  entries.forEach(entry => {
    const lastBlock = blocks[blocks.length - 1];
    
    if (!lastBlock || entry.timestamp - lastBlock.startTime > BLOCK_DURATION) {
      blocks.push({
        startTime: entry.timestamp,
        endTime: entry.timestamp,
        tokens: { input: 0, output: 0, cache_read: 0, cache_write: 0 },
        cost: 0,
        requests: 0,
        projects: new Set()
      });
    }
    
    const currentBlock = blocks[blocks.length - 1];
    currentBlock.endTime = entry.timestamp;
    currentBlock.tokens.input += entry.tokens.input;
    currentBlock.tokens.output += entry.tokens.output;
    currentBlock.tokens.cache_read += entry.tokens.cache_read;
    currentBlock.tokens.cache_write += entry.tokens.cache_write;
    currentBlock.cost += entry.cost;
    currentBlock.requests += 1;
    currentBlock.projects.add(entry.project);
  });
  
  return blocks.map(block => ({
    ...block,
    projects: Array.from(block.projects),
    duration: (block.endTime - block.startTime) / 1000 / 60 / 60, // in hours
    isActive: Date.now() - block.endTime < BLOCK_DURATION
  }));
}

export function aggregateByProject(entries) {
  const projectStats = new Map();
  
  entries.forEach(entry => {
    if (!projectStats.has(entry.project)) {
      projectStats.set(entry.project, {
        project: entry.project,
        tokens: { input: 0, output: 0, cache_read: 0, cache_write: 0 },
        cost: 0,
        requests: 0,
        firstSeen: entry.timestamp,
        lastSeen: entry.timestamp
      });
    }
    
    const stats = projectStats.get(entry.project);
    stats.tokens.input += entry.tokens.input;
    stats.tokens.output += entry.tokens.output;
    stats.tokens.cache_read += entry.tokens.cache_read;
    stats.tokens.cache_write += entry.tokens.cache_write;
    stats.cost += entry.cost;
    stats.requests += 1;
    stats.lastSeen = entry.timestamp;
  });
  
  return Array.from(projectStats.values());
}