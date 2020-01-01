export default async (io, args) => {
    const keyword = args[0];
    if (keyword === undefined) return 1;
    let input = '';
    let finished = false;
    while (!finished) {
        if ((input = await io.in()).includes('\x04')) {
            finished = true;
            let isNoReturnedEnd = /\w+\x04/.test(input);
            input = input.replace(/\x04.*/, '');
            if (isNoReturnedEnd) input = `${input}\n`;
        }
        const splittedLine = input.split(keyword);
        if (splittedLine.length === 1 && splittedLine[0] !== '\n') continue;
        for (let i = 0; i < splittedLine.length; i++) {
            io.out(splittedLine[i]);
            if (i !== splittedLine.length - 1) io.out(keyword, {color: 'red'});
        }
    }
    return 0;
};
