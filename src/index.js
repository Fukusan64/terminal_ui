import Terminal from './Terminal';
import Shell from './Shell';
window.onload = async () => {
    const terminal = new Terminal('terminal');
    const shell = new Shell(terminal, 'v0.0.2', '> ');

    shell.addCommand('true', () => 0);
    shell.addCommand('false', () => -1);
    shell.addCommand('echo', (io, args) => {
        io.out(`${args.join(' ')}\n`);
        return 0;
    });
    shell.addCommand('date', (io) => {
        io.out(`${(new Date()).toLocaleString()}\n`);
        return 0;
    });
    shell.addCommand('sleep', (io, args) => {
        const sec = parseInt(args[0]);
        if (Number.isNaN(sec)) {
            io.out(`"${args[0]}" is not a Integer\n`, {color: 'red'});
            return -1;
        }
        return new Promise(res => {
            setTimeout(() => res(0), sec * 1000);
        });
    });
    shell.addCommand('grep', async (io, args) => {
        const keyword = args[0];
        if (keyword === undefined) return 1;
        let input = '';
        let finished = false;
        while (!finished) {
            if ((input = await io.in()).includes('\x04')) {
                finished = true;
                input = input.replace(/\x04.*/, '');
            }
            for (const line of input.split('\n')) {
                const splittedLine = line.split(keyword);
                if (splittedLine.length === 1) continue;
                for (let i = 0; i < splittedLine.length; i++) {
                    io.out(splittedLine[i]);
                    if (i !== splittedLine.length - 1) io.out(keyword, {color: 'red'});
                }
                io.out('\n');
            }
        }
        return 0;
    });

    while(true) await shell.run();
};
