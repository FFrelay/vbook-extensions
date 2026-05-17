#!/usr/bin/env node

/**
 * VBook CLI Tool v2.0 — Professional extension development toolkit
 * 
 * Commands:
 *   create    — Scaffold a new extension with AI-ready templates
 *   validate  — Check Rhino compatibility and extension structure
 *   list      — List all extensions in the project
 *   debug     — Send a script to the device for testing
 *   test-all  — One-click full-flow test (home→gen→detail→toc→chap)
 *   install   — Install extension on the device
 *   build     — Package extension into plugin.zip
 *   publish   — Build + update plugin registry
 *   check-env — Verify environment config and device connectivity
 *   analyze   — Analyze website DOM using Browser API (for AI selector hints)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Command } = require('commander');
const c = require('./lib/colors');

const program = new Command();

program
    .name('vbook')
    .description(c.bold('VBook Extension CLI') + ' — Create, test, and publish VBook extensions')
    .version('2.0.0');

// Register all commands
require('./commands/create').register(program);
require('./commands/validate').register(program);
require('./commands/list').register(program);
require('./commands/debug').register(program);
require('./commands/test-all').register(program);
require('./commands/install').register(program);
require('./commands/build').register(program);
require('./commands/publish').register(program);
require('./commands/check-env').register(program);
require('./commands/analyze').register(program);

// Graceful exit
process.on('SIGINT', () => process.exit(0));

program.parse(process.argv);
