export default class Shell {
    constructor(terminal, prompt = '> ') {
        this.terminal = terminal;
        this.promptStr = prompt;
        this.status = 0;
        this.commands = new Map();
        this.addCommand('help', (io) => {
            io.out('available commands list\n');
            for (const key of [...this.commands.keys()].sort()) {
                io.out(`* ${key}\n`);
            }
            return 0;
        });
    }
    addCommand(name, func) {
        this.commands.set(name, func);
    }
    hasCommand(name) {
        return this.commands.has(name);
    }
    async execCommand(name, args) {
        let cmd;
        if (this.hasCommand(name)) cmd = this.commands.get(name);
        else cmd = io => io.out(`Command '${name}' not found\n`, {color: 'red'});
        let status = await cmd(this.terminal, args);
        if (typeof (status) !== 'number') status = -1;
        this.status = status;
    }
    parseCommand(input) {
        const words = input.split(/\s+/);
        const name = words.shift();
        const args = words;
        return {name, args};
    }
    async prompt() {
        this.terminal.out(this.promptStr, {color: this.status === 0 ? 'white' : 'red'});
        const command = await this.terminal.in({
            oninput: ({srcElement}) => {
                const {name} = this.parseCommand(srcElement.value);
                const hasCommand = this.hasCommand(name);
                srcElement.style.color = hasCommand ? 'cyan' : 'red';
            }
        });
        const {name, args} = this.parseCommand(command);
        await this.execCommand(name, args);
    }
}
