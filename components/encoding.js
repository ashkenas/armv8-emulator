import React from 'react';
import styles from '../styles/Encoding.module.css';

class Encoding extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<p>{this.props.parts.map((part, i) => {
            return (<span key={`encodingPart${i}`} className={`${styles.encoding} ${styles[part[0]]}`} data-label={part[3]}>
                {part[1].toString(2).padStart(part[2], '0')}
            </span>);
        })}</p>);
    }
}

export default Encoding;