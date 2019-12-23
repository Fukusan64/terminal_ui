export default (io, args) => {
    const sec = parseInt(args[0]);
    if (Number.isNaN(sec)) {
        io.out(`"${args[0]}" is not a Integer\n`, {color: 'red'});
        return -1;
    }
    return new Promise(res => {
        setTimeout(() => res(0), sec * 1000);
    });
};
