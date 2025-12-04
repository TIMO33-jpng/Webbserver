const net = require("net");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const ROOT = process.pkg ? path.dirname(process.execPath) : __dirname;

// write PID so external scripts can check
const pidFile = path.join(ROOT, 'forbidden_sqlserver.pid');
try { fs.writeFileSync(pidFile, String(process.pid)); } catch(e) {}
process.on('exit', () => { try { fs.unlinkSync(pidFile); } catch(e) {} });
process.on('SIGINT', () => process.exit());
process.on('SIGTERM', () => process.exit());

const sqlserver = net.createServer((socket) => {
    socket.on("data", (data) => {
        const request = data.toString();
        console.log("Received SQL query:", request);

        // Here you would normally process the SQL query.
        // For demonstration, we just echo back the received query.
        const response = `Executed query: ${request}\n`;
        socket.write(response);
    });
    socket.on("error", (err) => {
        console.log("Socket error:", err.message);
    });
     socket.on("close", () => {
        console.log("Connection closed")
    });
});

const port = 1433;
sqlserver.listen(port, () => {
    console.log("SQL Server running on port:", port);
}
);