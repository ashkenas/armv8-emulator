import React from 'react';
import styles from '../styles/Encoding.module.css';

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
                        {part.value.toString(2).padStart(part.length, '0')}
                    </span>
                )}
            </p>
        );
    }
}

export default Encoding;