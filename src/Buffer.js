export default class Buffer{
    constructor() {
        this.data = [];
    }
    in(input) {
        this.data.push(input);
    }
    out() {
        return this.data.shift();
    }
    clear() {
        this.data = [];
    }
}
