import Buffer from './Buffer';
import History from './History';
export default class Shell {
    constructor(
        terminal,
        version,
        promptFunc = (out, isError) => out('> ', {color: (isError ? 'red' : 'white')})
    ) {
        this.user;
        this.password;
        this.killed = false;
        this.version = version;
        this.terminal = terminal;
        this.promptFunc = promptFunc;
        this.history = new History();
        this.status = 0;
        this.defaultVal = '';
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
        let beforeBuffer = new Buffer();
        for (let i = 0; i < commandArray.length; i++){
            const commandData = commandArray[i];
            const io = {};
            const buffer = new Buffer();
            if (commandData.before === '|') {
                io.in = (...args) => beforeBuffer.out(...args);
            } else {
                io.in = (...args) => this.terminal.in(...args);
            }
            if (commandData.after === '|') {
                io.out = (...args) => buffer.in(...args);
            } else {
                io.out = (...args) => this.terminal.out(...args);
            }
            await this.execCommand(commandData.commandName, io, commandData.args);
            if (commandData.after === '|') {
                buffer.in('\x04');
            }
            beforeBuffer = buffer;
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
        input = input.replace(/\n/g, '');
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
        this.promptFunc((...args) => this.terminal.out(...args), this.status !== 0, this.user);
        let defaultColor;
        if (this.defaultVal !== '') defaultColor = this.parseCommand(this.defaultVal).err ? 'red' : 'cyan';
        const command = await this.terminal.in({
            customOninput: ({srcElement}) => {
                if (srcElement.value === '') {
                    srcElement.style.color = 'white';
                    return;
                }
                const {err} = this.parseCommand(srcElement.value);
                srcElement.style.color = err ? 'red' : 'cyan';
            },
            customOnkeydown: (e) => {
                switch (e.key) {
                    case 'ArrowUp': {
                        e.srcElement.value = this.history.previous();
                        if (e.srcElement.value === '') {
                            e.srcElement.style.color = 'white';
                            return;
                        }
                        const {err} = this.parseCommand(e.srcElement.value);
                        e.srcElement.style.color = err ? 'red' : 'cyan';
                        break;
                    }
                    case 'ArrowDown': {
                        e.srcElement.value = this.history.next();
                        if (e.srcElement.value === '') {
                            e.srcElement.style.color = 'white';
                            return;
                        }
                        const {err} = this.parseCommand(e.srcElement.value);
                        e.srcElement.style.color = err ? 'red' : 'cyan';
                        break;
                    }
                }
            },
            defaultVal: this.defaultVal,
            tabReturn: true,
            defaultColor
        });
        if (command.includes('\x04')) {
            this.killed = true;
            return;
        }
        const {commandArray} = this.parseCommand(command.replace(/\t/g, ''));
        if (command.includes('\x09')) {
            this.suggest(commandArray);
            return;
        }
        this.defaultVal = '';
        this.history.add(command);
        await this.execCommands(commandArray);
    }
    suggest(commandArray) {
        const {commandName: lastCommandName} = commandArray[commandArray.length - 1];
        const suggestList = [...this.commands.keys()]
            .filter(e => e.indexOf(lastCommandName) === 0)
            .sort()
            ;
        if (suggestList.length > 1) {
            suggestList.forEach((e, i) => {
                this.terminal.out(`${e}${i % 3 === 2 ? '\n' : '\t'}`);
            });
            if (suggestList.length % 3 !== 0) this.terminal.out('\n');
        }
        let matchedString = lastCommandName;
        if (suggestList.length !== 0) {
            while (true) {
                if (suggestList[0][matchedString.length] === undefined) break;
                matchedString = matchedString.concat(suggestList[0][matchedString.length]);
                if (!suggestList.every(e => e.indexOf(matchedString) === 0)) {
                    matchedString = matchedString.slice(0, -1);
                    break;
                }
            }
        }
        commandArray[commandArray.length - 1].commandName = matchedString;
        this.defaultVal = commandArray
            .map(e => {
                let block = e.commandName;
                if (e.args.length !== 0) block = `${block} ${e.args.join(' ')}`;
                if (e.after !== undefined) {
                    if (e.after === '|') e.after = ' | ';
                    block = `${block}${e.after}`;
                }
                return block;
            })
            .join('')
            ;
    }
    async run() {
        //多分シェルの仕事じゃないけど面倒なのでここでログイン処理をこなしてしまう
        this.terminal.clear();
        this.history.clear();
        this.terminal.out('login\n');
        this.terminal.out('user: ');
        this.user = (await this.terminal.in()).replace(/\n/g, '');
        if (this.user.includes('\x04')) return;
        this.terminal.out('password: ');
        this.password = (await this.terminal.in({hidden: true})).replace(/\n/g, '');
        if (this.password.includes('\x04')) return;
        this.killed = false;
        this.terminal.out(`Kuso Zako Terminal Modoki ${this.version}\n\n`, {color: 'gray'});

        while (!this.killed) await this.prompt();
    }
}
