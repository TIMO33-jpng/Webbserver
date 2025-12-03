//BEST BRATWURST TCP-SERVER EVER

const net = require("net");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const ROOT = process.pkg ? path.dirname(process.execPath) : __dirname

const config = require("./site.json");
const SITES = config.sites;

const ensureSiteDirs = () => {
    Object.values(SITES || {}).forEach(relPath => {
        const siteDir = path.join(ROOT, relPath);
        try {
            if (!fs.existsSync(siteDir)) {
                fs.mkdirSync(siteDir, { recursive: true });
                const indexPath = path.join(siteDir, "index.html");
                if (!fs.existsSync(indexPath)) {
                    fs.writeFileSync(indexPath,
                        `<!doctype html><meta charset="utf-8"><title>${path.basename(relPath)}</title><h1>${path.basename(relPath)} - Created</h1>`
                    );
                }
                console.log("Created site directory:", siteDir);
            }
        } catch (err) {
            console.log("Failed to create site directory", siteDir, err.message);
        }
    });
};

ensureSiteDirs();

const mimeTypes = {
    ".html": "text/html",
    ".php": "text/php",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml"
};

console.log("Logs här");
console.log("De sites som är igång är:", SITES);
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        console.log(data)
        const request = data.toString();
        console.log(request)

        let host = request.match(/Host: ([^\r\n]+)/)?.[1] || "";
        host = host.split(":")[0];

        let domainMap = {};
        try {
            const envEntries = (process.env.SITES || "").split(";").filter(Boolean).map(pair => pair.split("="));
            const envMap = Object.fromEntries(envEntries);
            domainMap = Object.keys(envMap).length ? envMap : (SITES || {});
        } catch (e) {
            domainMap = (SITES || {});
        }

        const publicRoot = path.join(ROOT, "public")

        let siteRoot = domainMap[host] ? path.join(ROOT, domainMap[host]) : publicRoot;

        const [method, urlRaw] = request.split(" ");
        const urlPath = (urlRaw || "").split('?')[0].replace(/^\/+/, '');

        let filepath;
        if (urlPath === "") {
            const idxPhp = path.join(siteRoot, "index.php"); 
            const idxHtml = path.join(siteRoot, "index.html");
            filepath = fs.existsSync(idxPhp) ? idxPhp : idxHtml;
        } else {
            let candidate = path.join(siteRoot, urlPath);
            const absCandidate = path.resolve(candidate);
            try {
                if (fs.existsSync(absCandidate) && fs.statSync(absCandidate).isDirectory()) {
                    const idxPhp = path.join(absCandidate, "index.php");
                    const idxHtml = path.join(absCandidate, "index.html");
                    if (fs.existsSync(idxPhp)) candidate = idxPhp;
                    else candidate = idxHtml;
                }
            } catch (e) {
                // ignore and use candidate
            }
            filepath = candidate;
        }

        const resolved = path.resolve(filepath);
        const allowedroot = path.resolve(publicRoot);

        if (!resolved.startsWith(allowedroot)) {
            socket.write("HTTP/1.1 403 Forbidden \r\n\r\n");
            socket.end();
            return;
        }

        if (!fs.existsSync(resolved)) {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
            socket.end();
            return;
        }

        const ext = path.extname(resolved);
        let fileData;
        try {
            fileData = fs.readFileSync(resolved);
        } catch (err) {
            socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
            socket.end();
            return;
        }
        const contentType = mimeTypes[ext] || "application/octet-stream";

        if (ext === ".php") {
            execFile("php", [resolved], (error, stdout, stderr) => {
                if (error) {
                    // If php binary isn't found, fall back to serving the PHP source as HTML
                    if (error.code === 'ENOENT') {
                        const responseHeaders =
                            `HTTP/1.1 200 OK\r\n` +
                            `Content-Type: text/html\r\n` +
                            `Content-Length: ${fileData.length}\r\n` +
                            `X-PHP-Execution: disabled\r\n` +
                            `\r\n`;
                        try {
                            socket.write(responseHeaders);
                            socket.write(fileData);
                            socket.end();
                        } catch (e) {
                            socket.end();
                        }
                        return;
                    }

                    socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
                    socket.end();
                    return;
                }

                const responseHeaders =
                    `HTTP/1.1 200 OK\r\n` +
                    `Content-Type: text/html\r\n` +
                    `Content-Length: ${Buffer.byteLength(stdout)}\r\n` +
                    `\r\n`;

                socket.write(responseHeaders);
                socket.write(stdout);
                socket.end();
            });
            return; 
        }

        const responseHeaders =
            `HTTP/1.1 200 OK\r\n` +
            `Content-Type: ${contentType}\r\n` +
            `Content-Length: ${fileData.length}\r\n` +
            `\r\n`;

        try {
            socket.write(responseHeaders);
            socket.write(fileData);
            socket.end();
        } catch (err) {
            console.log("File Read/Write error", err.message);
            socket.end();
        }

    });
    socket.on("close", () => {
        console.log("Connection closed")
    });
    socket.on("error", (err) => {
        if (err.code === "ECONNRESET") {
            console.log("Client clossed connection early(ECONNRESET). Ignoring.")
        }
        else {
            console.log("Socket error:", err.message)
            socket.destroy();
        }
    });
});

server.listen(4221, () => {
    console.log("Server running on port 4221");
});
