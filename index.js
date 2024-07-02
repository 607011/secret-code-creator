(function (window) {
    "use strict";

    let el = {};

    function convert() {
        let idx = 0;
        let symbols = [];
        for (const c of el.input.value) {
            if (c == '\n') {
                const br = document.createElement('br')
                br.setAttribute('data-idx', idx);
                symbols.push(br);
            }
            else {
                const span = document.createElement('span');
                span.setAttribute('data-idx', idx);
                span.addEventListener('click', onGlyphSelect);
                if (c === ' ') {
                    span.className = 'char c32';
                    span.title = '<SPACE>';
                }
                else {
                    span.className = `char c${c.charCodeAt(0)}`;
                    span.title = c;
                }
                span.setAttribute('data-char', c);
                symbols.push(span);
            }
            ++idx;
        }
        el.output.replaceChildren(...symbols);
    }

    function onInput(e) {
        localStorage.setItem('secretcodecreator.plaintext', e.target.value);
        convert();
    }

    function onChange(e) {
        localStorage.setItem('secretcodecreator.plaintext', e.target.value);
        convert();
    }

    function onLineHeightChanged(e) {
        const lineHeight = e.target.value;
        el.output.style.lineHeight = `${lineHeight}px`;
        localStorage.setItem('secretcodecreator.options.lineHeight', lineHeight);
    }

    function onDirectionChanged(e) {
        const direction = e.target.options[e.target.selectedIndex].value;
        el.output.style.direction = direction;
        localStorage.setItem('secretcodecreator.options.direction', direction);
    }

    function onWritingModeChanged(e) {
        const writingMode = e.target.options[e.target.selectedIndex].value;
        el.output.style.writingMode = writingMode;
        localStorage.setItem('secretcodecreator.options.writingMode', writingMode);
    }

    function onSymbolWidthChanged(e) {
        localStorage.setItem('secretcodecreator.options.symbolWidth', e.target.value);
        el.root.style.setProperty('--symbol-width', `${el.symbolWidth.value}px`);
    }

    function onSymbolHeightChanged(e) {
        localStorage.setItem('secretcodecreator.options.symbolHeight', e.target.value);
        el.root.style.setProperty('--symbol-height', `${el.symbolHeight.value}px`);
    }

    function onSymbolScaleChanged(e) {
        localStorage.setItem('secretcodecreator.options.symbolScale', e.target.value);
        el.root.style.setProperty('--symbol-scale', `${el.symbolScale.value}`);
    }

    function onSymbolPaddingChanged(e) {
        localStorage.setItem('secretcodecreator.options.symbolPadding', e.target.value);
        el.root.style.setProperty('--symbol-padding', `${el.symbolPadding.value}px`);
    }

    function onDragEnter(e) {
        if (!e.dataTransfer.types.includes('Files')) {
            e.dataTransfer.dropEffect = 'none';
            e.preventDefault();
            return false;
        }
        e.dataTransfer.dropEffect = 'copy';
        e.target.classList.add('dragging');
        e.preventDefault();
    }

    function onDragOver(e) {
        if (!e.dataTransfer.types.includes('Files')) {
            e.dataTransfer.dropEffect = 'none';
            e.preventDefault();
            return false;
        }
        e.dataTransfer.dropEffect = 'copy';
        e.preventDefault();
    }

    function onDragLeave(e) {
        e.dataTransfer.dropEffect = 'none';
        e.target.classList.remove('dragging');
        e.preventDefault();
    }

    function onDrop(e) {
        e.target.classList.remove('dragging')
        if (!e.dataTransfer.types.includes('Files'))
            return e.preventDefault();

        for (const item of e.dataTransfer.items) {
            if (item.kind !== 'file' || item.type !== 'image/png')
                break;
            const imgFile = item.getAsFile();
            const imgReader = new FileReader();
            imgReader.onload = function () {
                const dataURL = imgReader.result;
                const image = new Image;
                image.addEventListener('load', () => {
                    const iw = image.width / 8;
                    const ih = image.height / 24;
                    if (iw !== Math.floor(iw)) {
                        console.error('image width must be divisible by 8')
                        return;
                    }
                    if (ih !== Math.floor(ih)) {
                        console.error('image height must be divisible by 8')
                        return;
                    }
                    el.symbolWidth.value = iw;
                    localStorage.setItem('secretcodecreator.options.symbolWidth', iw);
                    el.symbolHeight.value = ih;
                    localStorage.setItem('secretcodecreator.options.symbolHeight', ih);
                    el.root.style.setProperty('--image', `url(${dataURL})`);
                    localStorage.setItem('secretcodecreator.image', `url(${dataURL})`);
                    updateVariables();
                }, false);
                image.src = dataURL;
            };
            imgReader.readAsDataURL(imgFile);
        }
        e.preventDefault();
    }

    function onInputSelect(e) {
        el.output.querySelectorAll('.highlighted')
            .forEach(item => item.classList.remove('highlighted'));
        for (let i = e.target.selectionStart; i < e.target.selectionEnd; ++i) {
            el.output.querySelector(`[data-idx="${i}"]`).classList.add('highlighted');
        }
        const scrollToElement = el.output.querySelector('.highlighted');
        if (scrollToElement) {
            scrollToElement.scrollIntoView({
                block: 'center',
                inline: 'center',
                behavior: 'smooth',
            });
        }
    }

    function onInputClick(e) {
        onInputSelect(e);
    }

    function onGlyphSelect(e) {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        scrollToSelection(el.input, idx);
        // selection range isn't highlighted unless the HTMLInputElement has focus
        el.input.focus();
        el.input.setSelectionRange(idx, idx + 1);
    }

    /**
     * Dirty hack to scroll to a certain position in a HTMLInputElement
     * 
     * @param {HTMLInputElement} inputElement 
     * @param {int} idx character position to scroll to
     */
    function scrollToSelection(inputElement, idx) {
        // first, cache value of HTMLInputElement so it can be restored later
        const txt = inputElement.value;
        // set HTMLInputElement's value to up until the position to be scrolled to
        inputElement.value = txt.substring(0, idx);
        // scroll there
        inputElement.scrollTop = idx;
        // restoring cached value will not alter scroll position
        inputElement.value = txt;
    }

    function updateVariables() {
        el.root.style.setProperty('--symbol-scale', `${el.symbolScale.value}`);
        el.root.style.setProperty('--symbol-width', `${el.symbolWidth.value}px`);
        el.root.style.setProperty('--symbol-height', `${el.symbolHeight.value}px`);
        el.root.style.setProperty('--symbol-padding', `${el.symbolPadding.value}px`);
    }

    function createStyles() {
        const firstIdx = 32;
        const rowWidth = 8;
        const pixW = parseInt(el.symbolWidth.value);
        const pixH = parseInt(el.symbolHeight.value);
        let styles = '';
        for (let rowIdx = 0; rowIdx < 24; ++rowIdx) {
            for (let colIdx = 0; colIdx < rowWidth; ++colIdx) {
                styles += `.c${colIdx + rowIdx * rowWidth + firstIdx} {
                    background-position: 
                    calc(-${colIdx * pixW}px * var(--symbol-scale)) 
                    calc(-${rowIdx * pixH}px * var(--symbol-scale));
                }\n`;
            }
        }
        document.head.querySelector('#symbol-styles').textContent = styles;
    }

    function restoreOptions() {
        el.input.value = localStorage.getItem('secretcodecreator.plaintext') || '';
        el.lineHeight.value = localStorage.getItem('secretcodecreator.options.lineHeight') || 1;
        el.direction.value = localStorage.getItem('secretcodecreator.options.direction') || 'ltr';
        el.writingMode.value = localStorage.getItem('secretcodecreator.options.writingMode') || 'horizontal-tb';
        el.symbolWidth.value = localStorage.getItem('secretcodecreator.options.symbolWidth') || 10;
        el.symbolHeight.value = localStorage.getItem('secretcodecreator.options.symbolHeight') || 6;
        el.symbolScale.value = localStorage.getItem('secretcodecreator.options.symbolScale') || 4;
        el.symbolPadding.value = localStorage.getItem('secretcodecreator.options.symbolPadding') || 2;
        el.root.style.setProperty('--image', localStorage.getItem('secretcodecreator.image') || 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAACQCAYAAACf+ewZAAAFUmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgZXhpZjpQaXhlbFhEaW1lbnNpb249IjgwIgogICBleGlmOlBpeGVsWURpbWVuc2lvbj0iMTQ0IgogICBleGlmOkNvbG9yU3BhY2U9IjEiCiAgIHRpZmY6SW1hZ2VXaWR0aD0iODAiCiAgIHRpZmY6SW1hZ2VMZW5ndGg9IjE0NCIKICAgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIKICAgdGlmZjpYUmVzb2x1dGlvbj0iNzIvMSIKICAgdGlmZjpZUmVzb2x1dGlvbj0iNzIvMSIKICAgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIKICAgcGhvdG9zaG9wOklDQ1Byb2Zp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}');
    }

    function main() {
        el.input = document.querySelector('#input');
        el.input.addEventListener('input', onInput);
        el.input.addEventListener('change', onChange);
        el.input.addEventListener('select', onInputSelect);
        el.input.addEventListener('click', onInputClick);
        el.lineHeight = document.querySelector('#line-height');
        el.lineHeight.addEventListener('change', onLineHeightChanged);
        el.direction = document.querySelector('#direction');
        el.direction.addEventListener('change', onDirectionChanged);
        el.writingMode = document.querySelector('#writing-mode');
        el.writingMode.addEventListener('change', onWritingModeChanged);
        el.symbolWidth = document.querySelector('#symbol-width');
        el.symbolWidth.addEventListener('change', onSymbolWidthChanged);
        el.symbolHeight = document.querySelector('#symbol-height');
        el.symbolHeight.addEventListener('change', onSymbolHeightChanged);
        el.symbolScale = document.querySelector('#symbol-scale');
        el.symbolScale.addEventListener('change', onSymbolScaleChanged);
        el.symbolPadding = document.querySelector('#symbol-padding');
        el.symbolPadding.addEventListener('change', onSymbolPaddingChanged);
        el.output = document.querySelector('#output');
        el.output.addEventListener('dragenter', onDragEnter);
        el.output.addEventListener('dragleave', onDragLeave);
        el.output.addEventListener('dragover', onDragOver);
        el.output.addEventListener('drop', onDrop);
        el.root = document.querySelector(':root');
        restoreOptions();
        createStyles();
        if (el.input.value.length !== 0) {
            convert();
        }
        else {
            el.output.appendChild(document.querySelector('#dropzone').content.cloneNode(true));
        }
        updateVariables();
        el.output.style.writingMode = el.writingMode.value;
        el.output.style.direction = el.direction.value;
        el.output.style.lineHeight = `${el.lineHeight.value}px`;
    }
    window.addEventListener('load', main);
})(window);
