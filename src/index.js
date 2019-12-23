import Terminal from './Terminal';
import Shell from './Shell';
import commands from './commands/index';

window.onload = async () => {
    const terminal = new Terminal('terminal');
    const shell = new Shell(terminal, 'v0.1.0', '> ');

    commands.forEach((val, key) => shell.addCommand(key, val));

    while(true) await shell.run();
};
