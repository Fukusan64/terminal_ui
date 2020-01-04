export default async function* readline(inputFunc) {
    let buffer = '';
    let finished = false;
    while (!finished) {
        let input = (await inputFunc());
        finished = input.includes('\x04');
        const isNoReturnedEnd = /\w+\x04/.test(input);
        input = input.replace(/\x04.*/, '');
        if (isNoReturnedEnd) input = `${input}\n`;

        const lines = input.split('\n');
        lines[0] = `${buffer}${lines[0]}`;
        buffer = lines.pop();
        yield* lines;
    }
    return;
}
