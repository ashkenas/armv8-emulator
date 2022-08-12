import { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import armasm from '@util/langdecl';
import styles from '@styles/Code.module.css';
import ScrollContent from './scrollContent';
import { store, updateText } from "@util/reduxUtils";
import { useDispatch, useSelector } from 'react-redux';
import "highlight.js/styles/base16/ashes.css";

hljs.configure({ ignoreUnescapedHTML: true });
hljs.addPlugin({
    'after:highlight': (result) => {
        const lineNumber = store.getState().lineNumber;

        result.value = result.value.replace(/^(.*?)$/gm, (() => {
            let i = 0; // Internally maintain line number as function state
            return (m, g) => {
                if (i++ === lineNumber)
                    return `<div class="${styles.highlighter}"></div>${g}`;
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
    }, [text, lineNumber, error]);

    const processFile = (file) => {
        file.text().then((newText) => {
            dispatch(updateText(newText.replaceAll(/\r/g, '')));
        });
    };

    return (
        <>
            <label className={styles.label} htmlFor="file" onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
                event.preventDefault();

                if (event.dataTransfer.items && event.dataTransfer.items.length) {
                    if (event.dataTransfer.items[0].kind === 'file') {
                        processFile(event.dataTransfer.items[0].getAsFile());
                    } else {
                        dispatch(updateText(event.dataTransfer.items[0].getAsString().replaceAll(/\r/g, '')));
                    }
                } else if (event.dataTransfer.files.length) {
                    processFile(event.dataTransfer.files[0]);
                }
            }} >Upload File</label>
            <input className={styles.file} id="file" type="file" onChange={(e) => {
                if (!e.target.files.length)
                    return;
                
                processFile(e.target.files[0]);
                e.target.value = '';
            }} />
            <ScrollContent>
                {!error && <code ref={codeRef} className={`${styles.code} language-armasm`}>{text}</code>}
                {!!error && <pre className={styles.error}>Parsing error occurred.<br/><br/>{error.toString()}</pre>}
            </ScrollContent>
        </>
    );
}
