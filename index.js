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
        updateVariables();
    }

    function onSymbolHeightChanged(e) {
        localStorage.setItem('secretcodecreator.options.symbolHeight', e.target.value);
        updateVariables();
    }

    function onSymbolScaleChanged(e) {
        localStorage.setItem('secretcodecreator.options.symbolScale', e.target.value);
        updateVariables();
    }

    function onSymbolPaddingChanged(e) {
        localStorage.setItem('secretcodecreator.options.symbolPadding', e.target.value);
        updateVariables();
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
        document.head.querySelector('#css-variables').textContent = `:root {
--symbol-scale: ${el.symbolScale.value};
--symbol-width: ${el.symbolWidth.value}px;
--symbol-height: ${el.symbolHeight.value}px;
--symbol-padding: ${el.symbolPadding.value}px;
}`;
    }

    function createStyles() {
        const styles = document.createElement('style');
        const firstIdx = 32;
        const rowWidth = 8;
        const pixW = parseInt(el.symbolWidth.value);
        const pixH = parseInt(el.symbolHeight.value);
        for (let rowIdx = 0; rowIdx < 24; ++rowIdx) {
            for (let colIdx = 0; colIdx < rowWidth; ++colIdx) {
                styles.textContent += `.c${colIdx + rowIdx * rowWidth + firstIdx} {
                    background-position: 
                    calc(-${colIdx * pixW}px * var(--symbol-scale)) 
                    calc(-${rowIdx * pixH}px * var(--symbol-scale));
                }`;
            }
        }
        document.head.appendChild(styles);
    }

    function restoreOptions() {
        el.input.value = localStorage.getItem('secretcodecreator.plaintext') || "";
        el.lineHeight.value = localStorage.getItem('secretcodecreator.options.lineHeight') || 1;
        el.direction.value = localStorage.getItem('secretcodecreator.options.direction') || 'ltr';
        el.writingMode.value = localStorage.getItem('secretcodecreator.options.writingMode') || 'horizontal-tb';
        el.symbolWidth.value = localStorage.getItem('secretcodecreator.options.symbolWidth') || 10;
        el.symbolHeight.value = localStorage.getItem('secretcodecreator.options.symbolHeight') || 6;
        el.symbolScale.value = localStorage.getItem('secretcodecreator.options.symbolScale') || 4;
        el.symbolPadding.value = localStorage.getItem('secretcodecreator.options.symbolPadding') || 2;
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
        restoreOptions();
        createStyles();
        convert();
        updateVariables();
        el.output.style.writingMode = el.writingMode.value;
        el.output.style.direction = el.direction.value;
        el.output.style.lineHeight = `${el.lineHeight.value}px`;
    }
    window.addEventListener('load', main);
})(window);
