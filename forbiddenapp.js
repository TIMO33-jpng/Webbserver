const { execSync } = require('child_process');
const inquirer = require('inquirer').default;

function run(cmd) {
    execSync(cmd, { stdio: 'inherit' });
}

async function main() {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Select an action:',
            choices: [
                { name: 'Start HTTPServer', value: 'start-httpserver' },
                { name: 'Start SQLServer', value: 'start-sqlserver' },
                { name: 'Stop HTTPServer', value: 'stop-httpserver' },
                { name: 'Stop SQLServer', value: 'stop-sqlserver' },
                { name: 'Restart HTTPServer', value: 'restart-httpserver' },
                { name: 'Restart SQLServer', value: 'restart-sqlserver' },
                { name: 'Start All', value: 'start-all' },
                { name: 'Stop All', value: 'stop-all' },
                { name: 'Restart All', value: 'restart-all' },
                { type: 'separator' },
                { name: 'Status', value: 'status' },
                { name: 'Cls', value: 'cls' },
                { name: 'help' || '?', value: 'help' },
                { name: 'Exit', value: 'exit' }
            ]
        }
    ]);

    if (action === 'exit') {
        console.log('Goodbye!');
        process.exit(0);
    }
    if (action === 'cls') {
        console.clear();
        return main(); // Loop back to menu
    }
    if (action === 'help') {
        console.log(`

            Available commands:
            - start-httpserver
            - start-sqlserver
            - stop-httpserver
            - stop-sqlserver
            - restart-httpserver
            - restart-sqlserver
            - start-all
            - stop-all
            - restart-all
            - status
            - cls
            - help
            Type 'exit' to quit the application.
        `);
        return main(); // Loop back to menu
    }

    try {
        switch (action) {
            case 'status':
                run('pm2 list');
                setTimeout(() => main(), 1000);
                return;
            case 'start-httpserver':
                run('pm2 start ecosystem.config.js --only forbidden_httpserver');
                await checkStatus('forbidden_httpserver');
                break;
            case 'start-sqlserver':
                run('pm2 start ecosystem.config.js --only forbidden_sqlserver');
                await checkStatus('forbidden_sqlserver');
                break;
            case 'stop-httpserver':
                run('pm2 stop forbidden_httpserver');
                break;
            case 'stop-sqlserver':
                run('pm2 stop forbidden_sqlserver');
                break;
            case 'restart-httpserver':
                run('pm2 restart forbidden_httpserver');
                await checkStatus('forbidden_httpserver');
                break;
            case 'restart-sqlserver':
                run('pm2 restart forbidden_sqlserver');
                await checkStatus('forbidden_sqlserver');
                break;
            case 'start-all':
                run('pm2 start ecosystem.config.js');
                await checkStatus('forbidden_httpserver');
                break;
            case 'stop-all':
                run('pm2 stop all');
                break;
            case 'restart-all':
                run('pm2 restart all');
                await checkStatus('forbidden_httpserver');
                break;
        }
        console.log('\n✓ Command executed successfully!\n');
        setTimeout(() => main(), 1000); // Loop back to menu
    } catch (e) {
        console.error("✗ Error executing command:", e.message);
        main(); // Loop back to menu
    }
}

async function checkStatus(appName) {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const output = execSync(`pm2 list`, { encoding: 'utf8' });
                
                if (output.includes(appName)) {
                    if (output.includes('online')) {
                        console.log(`\n✓ ${appName} is ONLINE\n`);
                    } else if (output.includes('stopped')) {
                        console.log(`\n✗ ${appName} is STOPPED\n`);
                    } else {
                        console.log(`\n⚠ ${appName} status unknown\n`);
                    }
                } else {
                    console.log(`\n⚠ ${appName} not found\n`);
                }
                resolve();
            } catch (e) {
                console.log(`\n✗ Could not check status\n`);
                resolve();
            }
        }, 3000);
    });
}

main();