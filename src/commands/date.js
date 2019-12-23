export default (io) => {
    io.out(`${(new Date()).toLocaleString()}\n`);
    return 0;
};
