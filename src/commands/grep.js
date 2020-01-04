import readline from '../utils/readline';
export default async (io, args) => {
    const keyword = args[0];
    if (keyword === undefined) return 1;
    const rl = readline(io.in);
    while (true) {
        const {done, value: line} = await rl.next();
        if(done) break;
        const splittedLine = line.split(keyword);
        if (splittedLine.length === 1) continue;
        for (let i = 0; i < splittedLine.length; i++) {
            io.out(splittedLine[i]);
            if (i !== splittedLine.length - 1) io.out(keyword, {color: 'red'});
        }
        io.out('\n');
    }
    return 0;
}
