import { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import armasm from '@util/langdecl';
import styles from '@styles/Code.module.css';
import "highlight.js/styles/base16/ashes.css";
import Parse from '../architecture/parse';
import ScrollContent from './scrollContent';
import { store } from "@util/reduxUtils";
import { useSelector } from 'react-redux';

hljs.configure({ ignoreUnescapedHTML: true });
hljs.addPlugin({
    'after:highlight': (result) => {
        const lineNumber = store.getState().lineNumber;

        result.value = result.value.replace(/^(.*?)$/gm, (() => {
            let i = 0; // Internally maintain line number as function state
            return (m, g) => {
                if (i++ === lineNumber)
                    return `<span class="${styles.highlighter}">${g}</span>`;
                return g;
            };
        })());
    }
});
hljs.registerLanguage('armasm', armasm);

export default function Code(props) {
    const lineNumber = useSelector((state) => state.lineNumber);
    const codeRef = useRef(null);
    const [text, setText] = useState(`.text
.global _start
rec_add:
    sub X1, X0, X19
    cbz X1, rec_add_base
    ldur X1, [X0, #0]
    add X0, X0, #8
    sub X28, X28, #16
    stur X1, [X28, #8]
    stur X30, [X28, #0]
    bl rec_add
    b rec_add_end
rec_add_base:
    mov X0, #0
    ret
rec_add_end:
    ldur X30, [X28, #0]
    ldur X1, [X28, #8]
    add X28, X28, #16
    add X0, X0, X1
    ret
_start:
    adr X0, array
    adr X19, end
    bl rec_add
    adr x1, out
    stur x0, [x1, #0]
    svc #0
.data
array:
    .dword 8, 4, 3
end:
    .dword 0
.bss
out:
    .space 8
.end`);
    const [error, setError] = useState(false);

    useEffect(() => {
        if(!error && codeRef && codeRef.current)
            hljs.highlightElement(codeRef.current);
    }, [text, lineNumber]);

    useEffect(() => {
        try {
            const p = new Parse(text);
            props.simulator.load(p.program);
            setError(false);
        } catch (e) {
            setError(e);
        }
    }, [text])

    const code = (
        <ScrollContent>
            <pre className={styles['code-container']}>
                <code ref={codeRef} className="language-armasm">
                    {text}
                </code>
            </pre>
        </ScrollContent>
    );

    const parsingError = <pre className={styles.error}>Parsing error occurred.<br/><br/>{error.toString()}</pre>;

    return (
        <>
            <input type="file" onChange={(e) => {
                if (!e.target.files.length)
                    return;
                
                e.target.files[0].text().then((newText) => {
                    setText(newText.replaceAll(/\r/g, ''));
                });
            }} />
            {!error && code}
            {!!error && parsingError}
        </>
    );
}
