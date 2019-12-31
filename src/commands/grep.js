export default async (io, args) => {
    const keyword = args[0];
    if (keyword === undefined) return 1;
    let input = '';
    let finished = false;
    while (!finished) {
        if ((input = await io.in()).includes('\x04')) {
            finished = true;
            input = input.replace(/\x04.*/, '');
            if (input[input.length - 1] !== '\n') input = `${input}\n`;
        }
        const splittedLine = input.split(keyword);
        if (splittedLine.length === 1) continue;
        for (let i = 0; i < splittedLine.length; i++) {
            io.out(splittedLine[i]);
            if (i !== splittedLine.length - 1) io.out(keyword, {color: 'red'});
        }
    }

    return 0;
};
