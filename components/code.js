import React from 'react';
import hljs from 'highlight.js/lib/core';
import armasm from 'highlight.js/lib/languages/armasm';
import "highlight.js/styles/default.css";

hljs.registerLanguage('armasm', armasm);

class Code extends React.Component {
    constructor(props) {
        super(props);
        this.codeRef = React.createRef();
    }

    componentDidMount() {
        hljs.highlightElement(this.codeRef.current);
    }

    render() {
        return (
            <pre>
                <code ref={this.codeRef} className="language-armasm">
{`.text
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
    svc 0             // exit
.data
array:
    .double 7, 5, 4, 8, 2, 9, 1, 3, 10, 6
length:
    .double 10`}
                </code>
            </pre>
        );
    }
}

export default Code;