const net = require("net");
const fs = require("fs");
const path = require("path");

const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml"
};

console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = data.toString();
        console.log(request)
        
        const [method, url] = request.split(" ");

        let filepath = url === "/" ? "./index.html" : "." + url;
        
        const ext = path.extname(filepath);

        if (!fs.existsSync(filepath)) {
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
            socket.end();
            return;
        }

        const fileData = fs.readFileSync(filepath);

        const contentType = mimeTypes[ext] || "application/octet-stream";

        const responseHeaders = 
        `HTTP/1.1 200 OK\r\n` +
        `Content-Type: ${contentType}\r\n` +
        `Content-Length: ${fileData.length}\r\n` +
        `\r\n`;

        socket.write(responseHeaders);
        socket.write(fileData);
        socket.end();        
    });
    socket.on("close", () => {
        socket.end();
    });
});

server.listen(4221, "localhost");
