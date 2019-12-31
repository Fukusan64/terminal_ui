import Terminal from './Terminal';
import Shell from './Shell';
import commands from './commands/index';

window.onload = async () => {
    const terminal = new Terminal('terminal');
    const shell = new Shell(
        terminal,
        'v0.3.2',
        (out, isError, user) => {
            out(`${user}@pc_hoge: `, {color: 'lime'});
            out('[', {color: 'cyan'});
            out('~');
            out(']', {color: 'cyan'});
            out(isError ? 'x' : ' ', {color: 'red'});
            out('> ');
        }
    );
    for (const [key, val] of Object.entries(commands)) shell.addCommand(key, val);
    while(true) await shell.run();
};
