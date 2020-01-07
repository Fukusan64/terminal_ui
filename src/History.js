export default class History{
    constructor(size = 100, data = []) {
        this.historyArray = data;
        this.pointer = -1;
        this.size = size;
    }
    previous() {
        if (this.pointer + 1 >= this.historyArray.length) {
            this.pointer = this.historyArray.length - 1;
            return this.historyArray[this.pointer];
        }
        this.pointer++;
        return this.historyArray[this.pointer];
    }
    next() {
        if (this.pointer - 1 < 0) {
            this.pointer = -1;
            return '';
        }
        this.pointer--;
        return this.historyArray[this.pointer];
    }
    add(command) {
        if (command === '\n') return;
        this.historyArray.unshift(command.replace('\n', ''));
        this.pointer = -1;
        if (this.historyArray.length > this.size) this.historyArray.pop();
    }
    clear() {
        this.historyArray = [];
        this.pointer = -1;
    }
};
