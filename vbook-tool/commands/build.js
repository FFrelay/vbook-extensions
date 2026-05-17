/**
 * BUILD COMMAND — Package extension into plugin.zip
 */
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { getPluginInfo } = require('../lib/plugin-info');
const { runValidation } = require('./validate');
const c = require('../lib/colors');

function register(program) {
    program.command('build')
        .description('Package the extension into a zip file')
        .option('--bump', 'Auto-increment version number')
        .option('--skip-validate', 'Skip validation before build')
        .action(async (options) => {
            try {
                const info = getPluginInfo();
                
                // Validate first (unless skipped)
                if (!options.skipValidate) {
                    console.log(c.step('BUILD', 'Running validation...'));
                    const validation = runValidation(info.root);
                    if (validation.errors > 0) {
                        console.error(c.error(`Build aborted: ${validation.errors} validation error(s). Fix them or use --skip-validate.`));
                        return;
                    }
                }

                // Auto-bump version if requested
                if (options.bump) {
                    const pluginJsonPath = path.join(info.root, 'plugin.json');
                    info.json.metadata.version = (info.json.metadata.version || 0) + 1;
                    fs.writeFileSync(pluginJsonPath, JSON.stringify(info.json, null, 2));
                    console.log(c.step('BUILD', `Version bumped to ${c.bold(info.json.metadata.version)}`));
                }

                const zipPath = path.join(info.root, 'plugin.zip');
                const output = fs.createWriteStream(zipPath);
                const archive = archiver('zip', { zlib: { level: 9 } });

                await new Promise((resolve, reject) => {
                    output.on('close', () => {
                        const sizeKB = (archive.pointer() / 1024).toFixed(2);
                        console.log(c.success(`Built ${c.bold(zipPath)} (${sizeKB} KB)`));
                        
                        // List contents
                        console.log(c.dim('\nContents:'));
                        console.log(c.dim('  plugin.json'));
                        console.log(c.dim('  icon.png'));
                        const srcDir = path.join(info.root, 'src');
                        if (fs.existsSync(srcDir)) {
                            fs.readdirSync(srcDir).forEach(f => {
                                console.log(c.dim(`  src/${f}`));
                            });
                        }
                        resolve();
                    });

                    archive.on('error', reject);
                    archive.pipe(output);

                    const metadata = { ...info.json };
                    if (metadata.metadata.encrypt) delete metadata.metadata.encrypt;

                    archive.directory(path.join(info.root, 'src'), 'src');
                    archive.file(path.join(info.root, 'icon.png'), { name: 'icon.png' });
                    archive.append(JSON.stringify(metadata, null, 2), { name: 'plugin.json' });

                    archive.finalize();
                });
            } catch (error) {
                console.error(c.error(error.message));
            }
        });
}

module.exports = { register };
