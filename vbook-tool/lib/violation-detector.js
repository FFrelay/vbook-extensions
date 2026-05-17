/**
 * Violation Detector
 * Scans JS code before writing to file, rejects if violations found.
 * Checks: Rhino incompatibilities, placeholder selectors, missing execute().
 */

// ─── Rhino violations ─────────────────────────────────────────────────────────

var RHINO_PATTERNS = [
    {
        name: 'async/await',
        regex: /\basync\s+function|\bawait\s+/,
        message: 'async/await không dùng được trong Rhino',
        fix: 'Dùng synchronous call hoặc callback'
    },
    {
        name: 'optional_chaining',
        regex: /\w+\?\.\w+/,
        message: '?. (optional chaining) không dùng được',
        fix: 'Dùng obj && obj.prop'
    },
    {
        name: 'nullish_coalescing',
        regex: /\?\?/,
        message: '?? (nullish coalescing) không dùng được',
        fix: 'Dùng a != null ? a : b'
    },
    {
        name: 'spread_in_call',
        regex: /\w+\(\s*\.\.\./,
        message: 'Spread trong function call không dùng được',
        fix: 'Dùng .apply(null, arr)'
    },
    {
        name: 'spread_in_array',
        regex: /\[\s*\.\.\./,
        message: 'Spread trong array không dùng được',
        fix: 'Dùng .slice() hoặc .concat()'
    },
    {
        name: 'default_params',
        regex: /function\s+\w+\s*\([^)]*=\s*/,
        message: 'Default parameter không dùng được',
        fix: 'Gán thủ công trong thân hàm: if (param == null) param = defaultValue;'
    }
];

/**
 * Detect Rhino-incompatible syntax in code.
 * @param {string} code - JS source code
 * @returns {Array<{line: number, pattern: string, message: string, fix: string}>}
 */
function detectRhinoViolations(code) {
    var violations = [];
    var lines = code.split('\n');

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var trimmed = line.trim();

        // Skip comments
        if (trimmed.indexOf('//') === 0) continue;
        if (trimmed.indexOf('*') === 0) continue;
        if (trimmed.indexOf('/*') === 0) continue;

        for (var j = 0; j < RHINO_PATTERNS.length; j++) {
            var pattern = RHINO_PATTERNS[j];
            if (pattern.regex.test(line)) {
                violations.push({
                    line: i + 1,
                    pattern: pattern.name,
                    message: pattern.message,
                    fix: pattern.fix
                });
            }
        }
    }

    return violations;
}

// ─── Placeholder detection ────────────────────────────────────────────────────

var PLACEHOLDER_LIST = [
    // Generic placeholders from templates
    'SELECTOR_ITEM', 'SELECTOR_TITLE', 'SELECTOR_COVER_IMG',
    'SELECTOR_AUTHOR', 'SELECTOR_STATUS', 'SELECTOR_DESCRIPTION',
    'SELECTOR_GENRE_LINKS', 'SELECTOR_CHAPTER_LINKS',
    'SELECTOR_NEXT_PAGE', 'SELECTOR_TOC_PAGINATION',
    'SELECTOR_CONTENT', 'SELECTOR_IMAGE_CONTAINER',
    'TODO_DOMAIN', 'TODO_AUTHOR', 'PATH_MOI', 'PATH_HOT',
    'PATH_HOAN', 'PATH_SEARCH', 'PATH_THELOAI',
    'PARAM_KEYWORD', 'PARAM_PAGE'
];

// Generic selectors AI often guesses without real inspection
var GENERIC_SELECTORS = [
    '.book-item', '.story-item', '.list-item', '.truyen-item',
    'h3 a', '.title a', '#content', '#chapter-content',
    '.chapter-c', '.chapter-content'
];

/**
 * Detect placeholder selectors or generic AI-guessed selectors.
 * @param {string} code - JS source code
 * @returns {Array<{placeholder: string, message: string}>}
 */
function detectPlaceholders(code) {
    var violations = [];
    var lines = code.split('\n');

    PLACEHOLDER_LIST.forEach(function(p) {
        lines.forEach(function(line) {
            var trimmed = line.trim();
            // Bỏ qua comment
            if (trimmed.indexOf('//') === 0) return;
            if (trimmed.indexOf('*') === 0) return;
            if (trimmed.indexOf('/*') === 0) return;
            
            if (line.indexOf(p) >= 0) {
                violations.push({
                    placeholder: p,
                    message: 'Template placeholder chưa được thay thế: ' + p
                });
            }
        });
    });

    GENERIC_SELECTORS.forEach(function(sel) {
        lines.forEach(function(line) {
            var trimmed = line.trim();
            // Bỏ qua comment
            if (trimmed.indexOf('//') === 0) return;
            if (trimmed.indexOf('*') === 0) return;
            if (trimmed.indexOf('/*') === 0) return;

            var pattern1 = 'select("' + sel + '")';
            var pattern2 = "select('" + sel + "')";
            if (line.indexOf(pattern1) >= 0 || line.indexOf(pattern2) >= 0) {
                violations.push({
                    placeholder: sel,
                    message: 'Generic selector không đáng tin — phải inspect để lấy selector thực tế: ' + sel
                });
            }
        });
    });

    return violations;
}

// ─── Missing execute function ─────────────────────────────────────────────────

/**
 * Check if the code has a proper execute() function.
 * @param {string} code - JS source code
 * @returns {boolean} true if missing execute function
 */
function detectMissingExecute(code) {
    return !/function\s+execute\s*\(/.test(code);
}

// ─── Run all checks ───────────────────────────────────────────────────────────

/**
 * Run all violation checks on the given code.
 * @param {string} code - JS source code
 * @returns {{ok: boolean, rhino_violations: Array, placeholder_violations: Array, missing_execute: boolean, total_violations: number, summary: string}}
 */
function runAll(code) {
    var rhino = detectRhinoViolations(code);
    var placeholders = detectPlaceholders(code);
    var missingExec = detectMissingExecute(code);

    var total = rhino.length + placeholders.length + (missingExec ? 1 : 0);
    var ok = total === 0;

    var parts = [];
    if (rhino.length > 0) parts.push(rhino.length + ' Rhino violation(s)');
    if (placeholders.length > 0) parts.push(placeholders.length + ' placeholder(s)');
    if (missingExec) parts.push('missing execute()');

    return {
        ok: ok,
        rhino_violations: rhino,
        placeholder_violations: placeholders,
        missing_execute: missingExec,
        total_violations: total,
        summary: ok ? '0 lỗi' : (total + ' lỗi tìm thấy: ' + parts.join(', '))
    };
}

module.exports = {
    detectRhinoViolations,
    detectPlaceholders,
    detectMissingExecute,
    runAll
};
