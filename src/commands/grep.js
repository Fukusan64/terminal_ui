export default async (io, args) => {
    const keyword = args[0];
    if (keyword === undefined) return 1;
    let input = '';
    let finished = false;
    while (!finished) {
        if ((input = await io.in()).includes('\x04')) {
            finished = true;
            input = input.replace(/\x04.*/, '');
        }
        for (const line of input.split('\n')) {
            const splittedLine = line.split(keyword);
            if (splittedLine.length === 1) continue;
            for (let i = 0; i < splittedLine.length; i++) {
                io.out(splittedLine[i]);
                if (i !== splittedLine.length - 1) io.out(keyword, {color: 'red'});
            }
            io.out('\n');
        }
    }
    return 0;
};
