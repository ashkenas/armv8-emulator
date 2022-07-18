import React from 'react';
import hljs from 'highlight.js/lib/core';
import armasm from '@util/langdecl';
import styles from '@styles/Code.module.css';
import "highlight.js/styles/base16/ashes.css";
import Parse from '../architecture/parse';

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
_start:
    add X0, XZR, #0   // i, loop counter
    adr X1, array     // a, data offset
    add X2, XZR, #0   // sum, aggregator
    adr X3, length
    ldur X3, [X3, #0]
loop:
    sub X5, X3, X0    // e = i - length
    cbz X5, loop_end  // if(e == 0) break;
    ldur X6, [X1, #0] // v = a[0]
    add X2, X2, X6    // sum += v
    add X0, X0, #1    // i++
    add X1, X1, #8    // a += 8
    b loop
loop_end:
    nop               // exit
.data
array: .dword 7, 5, 4, 8, 2, 9, 1, 3, 10, 6
length: .dword 10` };
        currentCodeComp = this;
        const p = new Parse(this.state.text);
        p.parseProgram()
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
                    const p = new Parse(this.state.text);
                    p.parseProgram()
                    this.props.simulator.load(p.program);
                    this.setState({ text: await e.target.files[0].text() })
                }} />
                <pre className={styles['code-container']}>
                    <code ref={this.codeRef} className="language-armasm">
                        {this.state.text}
                    </code>
                </pre>
            </>
        );
    }
}

export default Code;