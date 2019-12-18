export default class Terminal {
    constructor(terminalId) {
        this.id = terminalId;
        this.terminalElem = document.getElementById(this.id);
        this.terminalElem.addEventListener('click', () => {
            this.terminalElem
                .querySelector('input:last-child')
                .focus()
                ;
        });
    }
    in({oninput} = {}) {
        return new Promise(res => {
            const lastLine = this.terminalElem.lastElementChild;
            const inputElem = document.createElement('input');
            inputElem.type = 'text';
            if (lastLine !== null && [...lastLine.classList].includes('line')) {
                const spans = [...lastLine.children];
                if (spans.length !== 0) {
                    const lineWidth = lastLine.offsetWidth;
                    const spansWidth = spans
                        .map(e => e.offsetWidth)
                        .reduce((a, c) => a + c)
                        ;
                    inputElem.style.width = `${lineWidth - spansWidth}px`;
                } else {
                    inputElem.style.width = '100%';
                }
                lastLine.appendChild(inputElem);
            } else {
                const line = this._createNewLine();
                line.appendChild(inputElem);
                inputElem.style.width = '100%';
                this.terminalElem.appendChild(line);
            }
            inputElem.focus();
            if (typeof (oninput) === 'function') inputElem.addEventListener('input', oninput);
            let onchange, onkeydown;
            inputElem.addEventListener('change', onchange = (e) => {
                const text = e.srcElement.value;
                const color = e.srcElement.style.color;
                const bgColor = e.srcElement.style.backgroundColor;
                const currentLine = e.srcElement.parentNode;
                e.srcElement.removeEventListener('change', onchange);
                e.srcElement.removeEventListener('keydown', onkeydown);
                e.srcElement.remove();
                this._appendSpan(currentLine, text, {color, bgColor});
                this.terminalElem.appendChild(this._createNewLine());
                res(text);
            });
            inputElem.addEventListener('keydown', onkeydown = (e) => {
                if (e.ctrlKey && e.key === 'd') {
                    e.preventDefault();
                    e.stopPropagation();
                    const text = e.srcElement.value;
                    const color = e.srcElement.style.color;
                    const bgColor = e.srcElement.style.backgroundColor;
                    const currentLine = e.srcElement.parentNode;
                    e.srcElement.removeEventListener('change', onchange);
                    e.srcElement.removeEventListener('keydown', onkeydown);
                    e.srcElement.remove();
                    this._appendSpan(currentLine, `${text}^D`, {color, bgColor});
                    this.terminalElem.appendChild(this._createNewLine());
                    res(`${text}\x04`);
                }
            });
        });
    }
    out(text, style = {}) {
        const lines = text.split(/\n/);
        const lastLine = this.terminalElem.lastElementChild;
        if (lastLine !== null && [...lastLine.classList].includes('line')) {
            this._appendSpan(lastLine, lines[0], style);
        } else {
            const line = this._createNewLine();
            this._appendSpan(line, lines[0], style);
            this.terminalElem.appendChild(line);
        }
        for (let i = 1; i < lines.length; i++) {
            const line = this._createNewLine();
            this._appendSpan(line, lines[i], style);
            this.terminalElem.appendChild(line);
        }
        this.terminalElem.lastElementChild.scrollIntoView();
    }
    clear() {
        [...this.terminalElem.getElementsByClassName('line')].forEach(e => e.remove());
    }
    _escape(str) {
        str = str.replace(/&/g, '&amp;');
        str = str.replace(/</g, '&lt;');
        str = str.replace(/>/g, '&gt;');
        str = str.replace(/"/g, '&quot;');
        str = str.replace(/'/g, '&#39;');
        str = str.replace(/\s/g, '&nbsp;');
        return str;
    }
    _createNewLine() {
        const line = document.createElement('div');
        line.classList.add('line');
        return line;
    }
    _appendSpan(line, string, {color, bgColor} = {}) {
        const span = document.createElement('span');
        span.innerHTML = this._escape(string);
        if (color !== undefined) span.style.color = color;
        if (bgColor !== undefined) span.style.backgroundColor = bgColor;
        line.appendChild(span);
    }
}
