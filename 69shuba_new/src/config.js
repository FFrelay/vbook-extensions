// ================================================
// CONFIGURATION FOR 69SHUBA EXTENSION
// ================================================

let BASE_URL = 'https://www.69shuba.com';

// Allow override via environment variable
try {
    if (CONFIG_URL && CONFIG_URL.length > 0) {
        BASE_URL = CONFIG_URL;
    }
} catch (error) {
    // CONFIG_URL not defined, use default
}

// Log current config when loaded
Console.log('[CONFIG] BASE_URL: ' + BASE_URL);