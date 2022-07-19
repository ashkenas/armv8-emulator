import React from 'react';
import hljs from 'highlight.js/lib/core';
import armasm from '@util/langdecl';
import styles from '@styles/Code.module.css';
import "highlight.js/styles/base16/ashes.css";
import Parse from '../architecture/parse';
import ScrollContent from './scrollContent';

let currentCodeComp = null;

hljs.configure({ ignoreUnescapedHTML: true });
hljs.addPlugin({
    'after:highlight': (result) => {
        result.value = result.value.replace(/^(.*?)$/gm, (() => {
            let i = 0; // Internally maintain line number as function state
            return (m, g) => {
                if (i++ === currentCodeComp.props.lineNumber)
                    return `<span class="${styles.highlighter}">${g}</span>`;
                return g;
            };
        })());
    }
});
hljs.registerLanguage('armasm', armasm);

class Code extends React.Component {
    constructor(props) {
        super(props);
        this.codeRef = React.createRef();
        this.state = { text:
`.text
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
    svc #0
.data
array: .dword 8, 4, 3
end: .char 0` };
        currentCodeComp = this;
        const p = new Parse(this.state.text);
        p.parseProgram();
        props.simulator.load(p.program);
    }

    componentDidMount() {
        hljs.highlightElement(this.codeRef.current);
    }
    
    componentDidUpdate() {
        hljs.highlightElement(this.codeRef.current);
    }

    render() {
        return (
            <>
                <input type="file" onChange={async (e) => {
                    const text = await e.target.files[0].text();
                    const p = new Parse(text);
                    p.parseProgram();
                    this.props.simulator.load(p.program);
                    this.setState({ text: text });
                }} />
                <ScrollContent>
                    <pre className={styles['code-container']}>
                        <code ref={this.codeRef} className="language-armasm">
                            {this.state.text}
                        </code>
                    </pre>
                </ScrollContent>
            </>
        );
    }
}

export default Code;