/**
 * LIST COMMAND — List all extensions in the project
 */
const { scanExtensions } = require('../lib/plugin-list');
const c = require('../lib/colors');

function register(program) {
    program.command('list')
        .description('List all extensions in the project')
        .option('-t, --type <type>', 'Filter by type (novel, comic, chinese_novel)')
        .option('-l, --locale <locale>', 'Filter by locale (vi_VN, zh_CN)')
        .option('--json', 'Output as JSON (for scripting)')
        .action((options) => {
            const extensions = scanExtensions({
                filterType: options.type,
                filterLocale: options.locale
            });

            if (options.json) {
                console.log(JSON.stringify(extensions, null, 2));
                return;
            }

            console.log(c.bold(`\n📦 VBook Extensions (${extensions.length} total)\n`));

            if (extensions.length === 0) {
                console.log(c.dim('  No extensions found.'));
                return;
            }

            // Table header
            const header = ` ${'#'.padStart(2)} │ ${'Name'.padEnd(22)} │ ${'Type'.padEnd(15)} │ ${'Locale'.padEnd(6)} │ ${'Ver'.padStart(3)} │ ${'Zip'.padStart(3)} │ Source`;
            const separator = '─'.repeat(2) + '─┼─' + '─'.repeat(22) + '─┼─' + '─'.repeat(15) + '─┼─' + '─'.repeat(6) + '─┼─' + '─'.repeat(3) + '─┼─' + '─'.repeat(3) + '─┼─' + '─'.repeat(30);
            
            console.log(c.dim(header));
            console.log(c.dim(separator));

            extensions.forEach((ext, i) => {
                const meta = ext.metadata;
                const num = String(i + 1).padStart(2);
                const name = (meta.name || ext.dirName).padEnd(22).substring(0, 22);
                const type = (meta.type || '-').padEnd(15);
                const locale = (meta.locale || '-').padEnd(6);
                const ver = String(meta.version || 0).padStart(3);
                const zip = ext.hasZip ? c.green(' ✓ ') : c.red(' ✗ ');
                const source = meta.source || '-';
                const tag = meta.tag ? c.red(` [${meta.tag}]`) : '';

                console.log(` ${c.dim(num)} │ ${c.bold(name)} │ ${type} │ ${locale} │ ${ver} │ ${zip} │ ${c.dim(source)}${tag}`);
            });

            console.log('');
            
            // Summary by type
            const typeCounts = {};
            extensions.forEach(ext => {
                const t = ext.metadata.type || 'unknown';
                typeCounts[t] = (typeCounts[t] || 0) + 1;
            });
            const summary = Object.entries(typeCounts).map(([t, n]) => `${t}: ${n}`).join(', ');
            console.log(c.dim(`  Types: ${summary}`));
            console.log('');
        });
}

module.exports = { register };
