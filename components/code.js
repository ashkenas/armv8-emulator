import { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import armasm from '@util/langdecl';
import styles from '@styles/Code.module.css';
import "highlight.js/styles/base16/ashes.css";
import Parse from '../architecture/parse';
import ScrollContent from './scrollContent';
import { store, updateText } from "@util/reduxUtils";
import { useDispatch, useSelector } from 'react-redux';

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

export default function Code({ error }) {
    const lineNumber = useSelector((state) => state.lineNumber);
    const text = useSelector((state) => state.text);
    const dispatch = useDispatch();
    const codeRef = useRef(null);

    useEffect(() => {
        if(!error && codeRef && codeRef.current)
            hljs.highlightElement(codeRef.current);
    }, [text, lineNumber]);

    return (
        <>
            <input type="file" onChange={(e) => {
                if (!e.target.files.length)
                    return;
                
                e.target.files[0].text().then((newText) => {
                    dispatch(updateText(newText.replaceAll(/\r/g, '')));
                });
            }} />
            <ScrollContent>
                <pre className={styles['code-container']}>
                    {!error && <code ref={codeRef} className="language-armasm">{text}</code>}
                    {!!error && <pre className={styles.error}>Parsing error occurred.<br/><br/>{error.toString()}</pre>}
                </pre>
            </ScrollContent>
        </>
    );
}
