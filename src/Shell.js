import Buffer from './Buffer';
export default class Shell {
    constructor(terminal, version, prompt = '> ') {
        this.user;
        this.password;
        this.killed = false;
        this.version = version;
        this.terminal = terminal;
        this.buffer = new Buffer();
        this.promptStr = prompt;
        this.status = 0;
        this.commands = new Map();
        this.addCommand('help', (io) => {
            io.out('available commands list\n');
            for (const key of [...this.commands.keys()].sort()) {
                io.out(`* ${key}\n`, {color:'cyan'});
            }
            io.out('available control operator list\n');
            for (const key of ['";"', '"&&"'].sort()) {
                io.out(`* ${key}\n`, {color: 'cyan'});
            }
            io.out('available pipe list\n');
            for (const key of ['"|"'].sort()) {
                io.out(`* ${key}\n`, {color: 'cyan'});
            }
            return 0;
        });
        this.addCommand('clear', () => {
            this.terminal.clear();
            return 0;
        });
        this.addCommand('exit', () => {
            this.killed = true;
            return 0;
        });
    }
    addCommand(name, func) {
        this.commands.set(name, func);
    }
    hasCommand(name) {
        return this.commands.has(name);
    }
    async execCommands(commandArray) {
        for (let i = 0; i < commandArray.length; i++){
            const commandData = commandArray[i];
            const io = {};
            if (commandData.before === '|') {
                io.in = (...args) => this.buffer.in(...args);
            } else {
                io.in = (...args) => this.terminal.in(...args);
            }
            if (commandData.after === '|') {
                this.buffer.clear();
                io.out = (...args) => this.buffer.out(...args);
            } else {
                io.out = (...args) => this.terminal.out(...args);
            }
            await this.execCommand(commandData.commandName, io, commandData.args);
            if (commandData.after === '|') {
                this.buffer.out('\x04');
            }
            if (this.status !== 0 && commandData.after === '&&') break;
            if (this.killed) break;
        }
    }
    async execCommand(name, io, args) {
        let cmd;
        if (this.hasCommand(name)) cmd = this.commands.get(name);
        else {
            this.terminal.out(`Command '${name}' not found\n`, {color: 'red'});
            this.status = -1;
            return;
        }
        let status = await cmd(io, args);
        if (typeof (status) !== 'number') status = -1;
        this.status = status;
    }
    parseCommand(input) {
        let keyword = '';
        const tokens = [];
        let err = false;
        for (let i = 0; i < input.length; i++) {
            if (input[i] === '|' || input[i] === ';') {
                tokens.push(keyword, input[i]);
                keyword = '';
            } else if (input[i] === '&' && input[i + 1] === '&') {
                tokens.push(keyword, '&&');
                keyword = '';
                i++;
            } else {
                keyword = keyword.concat(input[i]);
            }
        }
        tokens.push(keyword);
        // ----------
        const commandArray = [];
        for (let i = 0; i < tokens.length; i += 2){
            const [before, current, after] = [tokens[i - 1], tokens[i], tokens[i + 1]];
            const words = current.trim().split(/\s+/).map(w => w.trim());
            const commandName = words.shift();
            if (!this.hasCommand(commandName)) {
                err = true;
            }
            const args = words;
            commandArray.push({
                before,
                after,
                commandName,
                args,
            });
        }
        return {commandArray, err};
    }
    async prompt() {
        this.terminal.out(this.promptStr, {color: this.status === 0 ? 'white' : 'red'});
        const command = await this.terminal.in({
            oninput: ({srcElement}) => {
                if (srcElement.value === '') {
                    srcElement.style.color = 'white';
                    return;
                }
                const {err} = this.parseCommand(srcElement.value);
                srcElement.style.color = err ? 'red' : 'cyan';
            }
        });
        if (command.includes('\x04')) {
            this.killed = true;
            return;
        }
        const {commandArray} = this.parseCommand(command);
        await this.execCommands(commandArray);
    }
    async run() {
        this.terminal.clear();
        this.terminal.out('login\n');
        this.terminal.out('user: ');
        this.user = await this.terminal.in();
        if (this.user.includes('\x04')) return;
        this.terminal.out('password: ');
        this.password = await this.terminal.in({hidden: true});
        if (this.password.includes('\x04')) return;
        this.killed = false;
        this.terminal.out(`Kuso Zako Terminal Modoki ${this.version}\n\n`, {color: 'gray'});

        while (!this.killed) await this.prompt();
    }
}
