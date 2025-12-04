module.exports = {
    apps: [
        {
            name: "forbidden_httpserver",
            script: "httpserver.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "200M",
            env: {
                NODE_ENV: "production"
            }
        },
        {
            name: "forbidden_sqlserver",
            script: "sqlserver.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "200M",
            env: {
                NODE_ENV: "production"
            }
        }

    ]
};
