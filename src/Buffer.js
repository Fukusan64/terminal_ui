export default class Buffer{
    constructor() {
        this.data = [];
    }
    out(input) {
        this.data.push(input);
    }
    in() {
        return this.data.shift();
    }
    clear() {
        this.data = [];
    }
}
