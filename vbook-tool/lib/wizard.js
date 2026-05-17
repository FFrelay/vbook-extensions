const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', '.wizard-state.json');

/**
 * Get the current wizard state for a site URL.
 * @param {string} siteUrl 
 * @returns {object|null}
 */
function getState(siteUrl) {
    if (!fs.existsSync(STATE_FILE)) return null;
    try {
        const states = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        return states[siteUrl] || null;
    } catch (e) {
        return null;
    }
}

/**
 * Save the wizard state for a site URL.
 * @param {string} siteUrl 
 * @param {object} data 
 */
function saveState(siteUrl, data) {
    let states = {};
    if (fs.existsSync(STATE_FILE)) {
        try {
            states = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        } catch (e) {}
    }
    states[siteUrl] = {
        ...states[siteUrl],
        ...data,
        updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(states, null, 2), 'utf8');
}

/**
 * Clear state for a site URL.
 * @param {string} siteUrl 
 */
function clearState(siteUrl) {
    if (!fs.existsSync(STATE_FILE)) return;
    try {
        const states = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        delete states[siteUrl];
        fs.writeFileSync(STATE_FILE, JSON.stringify(states, null, 2), 'utf8');
    } catch (e) {}
}

module.exports = { getState, saveState, clearState };
