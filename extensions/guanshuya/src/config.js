// config.js — Base URL của site
// Dùng let (KHÔNG const) để VBook có thể inject CONFIG_URL khi cần
let BASE_URL = "https://m.guanshuya.net";
try { if (CONFIG_URL) BASE_URL = CONFIG_URL; } catch (e) {}
