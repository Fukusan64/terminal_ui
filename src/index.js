import Terminal from './Terminal';
import Shell from './Shell';
import commands from './commands/index';

window.onload = async () => {
    const terminal = new Terminal('terminal');
    const shell = new Shell(terminal, 'v0.1.0', '> ');

    for (const [key, val] of Object.entries(commands)) shell.addCommand(key, val);

    while(true) await shell.run();
};
