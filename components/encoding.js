import React from 'react';
import styles from '../styles/Encoding.module.css';
import BinaryNumber from './binaryNumber';

class Encoding extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (!this.props.parts)
            return <></>;

        return (
            <p>
                {this.props.parts.map((part, i) => 
                    <span key={`encodingPart${i}`} className={`${styles.encoding} ${styles[part.type]}`} data-label={part.tooltip}>
                        <BinaryNumber value={part.value} length={part.length} />
                    </span>
                )}
            </p>
        );
    }
}

export default Encoding;