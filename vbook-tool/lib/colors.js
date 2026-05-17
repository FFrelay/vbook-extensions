/**
 * ANSI color helpers — zero dependencies, replaces chalk
 */
const enabled = process.env.NO_COLOR == null && process.stdout.isTTY !== false;

const code = (open, close) => enabled
    ? (s) => `\x1b[${open}m${s}\x1b[${close}m`
    : (s) => String(s);

const bold    = code(1, 22);
const dim     = code(2, 22);
const red     = code(31, 39);
const green   = code(32, 39);
const yellow  = code(33, 39);
const blue    = code(34, 39);
const magenta = code(35, 39);
const cyan    = code(36, 39);
const white   = code(37, 39);
const gray    = code(90, 39);

// Semantic helpers
const success = (s) => green(`✅ ${s}`);
const error   = (s) => red(`❌ ${s}`);
const warn    = (s) => yellow(`⚠️  ${s}`);
const info    = (s) => cyan(`ℹ️  ${s}`);
const step    = (label, msg) => `${cyan(`[${label}]`)} ${msg}`;

module.exports = {
    bold, dim, red, green, yellow, blue, magenta, cyan, white, gray,
    success, error, warn, info, step
};
