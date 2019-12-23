export default (io, args) => {
    io.out(`${args.join(' ')}\n`);
    return 0;
};
