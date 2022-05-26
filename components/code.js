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
        hljs.highlightBlock(this.codeRef.current);
    }

    render() {
        return (<pre><code ref={this.codeRef} className="language-armasm">
{`.text
.global _start
_start:
    add X1, XZR, #4`}
        </code></pre>);
    }
}

export default Code;