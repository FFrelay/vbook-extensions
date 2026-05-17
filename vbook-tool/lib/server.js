/**
 * Shared local HTTP server for serving extension files to the VBook device.
 * Used by `debug` and `test-all` commands.
 */
const http = require('http');
const path = require('path');
const fs = require('fs');
const { getLocalIP } = require('../utils');

/**
 * Start a file-serving HTTP server.
 * @param {string} pluginRoot  Absolute path to the extension directory
 * @param {number} [port]      Port number (defaults to LOCAL_PORT env)
 * @returns {Promise<{ server: http.Server, localIP: string, localPort: number }>}
 */
function startFileServer(pluginRoot, port) {
    const localPort = port || parseInt(process.env.LOCAL_PORT || '8080');
    const localIP = getLocalIP();
    const workspaceRoot = path.dirname(pluginRoot);

    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const fileName = url.searchParams.get('file');
            const rootName = url.searchParams.get('root');

            if (!fileName || !rootName) {
                res.writeHead(400);
                return res.end('Missing params');
            }

            const requestedPath = path.join(workspaceRoot, rootName, fileName);
            if (fs.existsSync(requestedPath)) {
                const content = fs.readFileSync(requestedPath);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(content.toString('base64'));
            } else {
                res.writeHead(404);
                res.end('Not found');
            }
        });

        server.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                reject(new Error(`Port ${localPort} is already in use. Kill the process or change LOCAL_PORT in .env`));
            } else {
                reject(e);
            }
        });

        server.listen(localPort, localIP, () => {
            resolve({ server, localIP, localPort });
        });
    });
}

/**
 * Build the TCP request headers for VBook device communication.
 * @param {object} opts
 * @param {string} opts.ip        Device IP
 * @param {number} opts.port      Device port
 * @param {string} opts.endpoint  'test' or 'install'
 * @param {string} opts.base64Data  Base64-encoded JSON payload
 * @param {string} [opts.connection='keep-alive']
 * @returns {string}
 */
function buildRequestHeaders({ ip, port, endpoint, base64Data, connection = 'keep-alive' }) {
    return (
        `GET /${endpoint} HTTP/1.1\r\n` +
        `Host: ${ip}:${port}\r\n` +
        `Connection: ${connection}\r\n` +
        `User-Agent: okhttp/3.12.6\r\n` +
        `Accept-Encoding: gzip\r\n` +
        `data: ${base64Data}\r\n\r\n`
    );
}

module.exports = { startFileServer, buildRequestHeaders };
