/**
 * PUBLISH COMMAND — Build extension + update root plugin.json
 * Replaces the standalone update_plugin_list.js workflow
 */
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { getPluginInfo, getProjectRoot, getExtensionsDir } = require('../lib/plugin-info');
const { scanExtensions, generatePluginList, writePluginList } = require('../lib/plugin-list');
const { runValidation } = require('./validate');
const c = require('../lib/colors');

/**
 * Build a single extension into plugin.zip
 */
async function buildExtension(extRoot) {
    const pluginJson = JSON.parse(fs.readFileSync(path.join(extRoot, 'plugin.json'), 'utf8'));
    const zipPath = path.join(extRoot, 'plugin.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
        output.on('close', () => resolve(archive.pointer()));
        archive.on('error', reject);
        archive.pipe(output);

        const metadata = { ...pluginJson };
        if (metadata.metadata && metadata.metadata.encrypt) delete metadata.metadata.encrypt;

        const srcDir = path.join(extRoot, 'src');
        if (fs.existsSync(srcDir)) archive.directory(srcDir, 'src');
        
        const iconPath = path.join(extRoot, 'icon.png');
        if (fs.existsSync(iconPath)) archive.file(iconPath, { name: 'icon.png' });
        
        archive.append(JSON.stringify(metadata, null, 2), { name: 'plugin.json' });
        archive.finalize();
    });
}

function register(program) {
    program.command('publish')
        .description('Build extension + update plugin list (replaces update_plugin_list.js)')
        .option('--all', 'Rebuild ALL extensions')
        .option('--list-only', 'Only regenerate root plugin.json (no build)')
        .option('--my', 'Build only extensions matching the author in .env')
        .option('--skip-validate', 'Skip validation')
        .action(async (options) => {
            const projectRoot = getProjectRoot();

            try {
                if (options.listOnly) {
                    // Mode 1: Just regenerate plugin list (replaces update_plugin_list.js)
                    console.log(c.bold('\n📋 Regenerating plugin list...\n'));
                    
                    const extensions = scanExtensions();
                    const result = writePluginList(generatePluginList(extensions));
                    
                    console.log(c.success(`Wrote ${result.count} extensions to ${path.basename(result.path)}`));
                    
                    // Show summary
                    extensions.forEach((ext, i) => {
                        const status = ext.hasZip ? c.green('✓') : c.red('✗');
                        console.log(c.dim(`  ${status} ${ext.metadata.name} v${ext.metadata.version}`));
                    });
                    console.log('');
                    return;
                }

                if (options.all || options.my) {
                    // Mode 2: Build all/my extensions + regenerate list
                    console.log(c.bold(`\n🔨 Building ${options.my ? 'YOUR' : 'ALL'} extensions...\n`));
                    
                    let extensions = scanExtensions();
                    if (options.my) {
                        const envAuthor = process.env.author || process.env.AUTHOR || '';
                        if (!envAuthor) throw new Error("Author not set in .env");
                        extensions = extensions.filter(ext => ext.metadata.author === envAuthor);
                        console.log(c.dim(`Found ${extensions.length} extensions by author: ${envAuthor}`));
                    }

                    let built = 0, failed = 0, skipped = 0;

                    let rootPlugins = [];
                    try {
                        const rootJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'plugin.json'), 'utf8'));
                        if (rootJson.data) rootPlugins = rootJson.data;
                    } catch(e) {}

                    for (const ext of extensions) {
                        const extRoot = path.join(getExtensionsDir(), ext.dirName);
                        const srcDir = path.join(extRoot, 'src');
                        
                        if (!fs.existsSync(srcDir)) {
                            console.log(c.dim(`  ⏭ ${ext.metadata.name} (no src/)`));
                            continue;
                        }

                        const rootRecord = rootPlugins.find(p => p.name === ext.metadata.name);
                        if (rootRecord && ext.metadata.version <= rootRecord.version) {
                            console.log(c.dim(`  ⏭ ${ext.metadata.name} (v${ext.metadata.version} <= root v${rootRecord.version})`));
                            skipped++;
                            continue;
                        }

                        try {
                            // Validate first
                            if (!options.skipValidate) {
                                const validation = runValidation(extRoot);
                                if (validation.errors > 0) {
                                    console.log(c.red(`  ❌ ${ext.metadata.name} — ${validation.errors} validation error(s)`));
                                    failed++;
                                    continue;
                                }
                            }

                            const size = await buildExtension(extRoot);
                            const sizeKB = (size / 1024).toFixed(1);
                            console.log(c.green(`  ✅ ${ext.metadata.name}`) + c.dim(` (${sizeKB} KB)`));
                            built++;
                        } catch (e) {
                            console.log(c.red(`  ❌ ${ext.metadata.name} — ${e.message}`));
                            failed++;
                        }
                    }

                    console.log(c.bold(`\n  Built: ${built}, Failed: ${failed}, Skipped: ${skipped}\n`));

                    // Regenerate plugin list
                    const result = writePluginList();
                    console.log(c.success(`Updated ${path.basename(result.path)} with ${result.count} extensions`));
                    console.log('');
                    return;
                }

                // Mode 3: Build current extension + update list
                const info = getPluginInfo();
                console.log(c.bold(`\n🚀 Publishing: ${c.cyan(info.json.metadata.name)}\n`));

                // Validate
                if (!options.skipValidate) {
                    console.log(c.step('1/3', 'Validating...'));
                    const validation = runValidation(info.root);
                    if (validation.errors > 0) {
                        validation.messages.forEach(m => console.log(m));
                        console.error(c.error(`Publish aborted: ${validation.errors} error(s). Use --skip-validate to force.`));
                        return;
                    }
                    console.log(c.green('    Passed'));
                }

                // Build
                console.log(c.step('2/3', 'Building plugin.zip...'));
                const size = await buildExtension(info.root);
                console.log(c.green(`    ${(size / 1024).toFixed(1)} KB`));

                // Update list
                console.log(c.step('3/3', 'Updating plugin list...'));
                const result = writePluginList();
                console.log(c.green(`    ${result.count} extensions in registry`));

                console.log(c.bold(c.green('\n✅ Published successfully!\n')));

            } catch (error) {
                console.error(c.error(error.message));
            }
        });
}

module.exports = { register };
