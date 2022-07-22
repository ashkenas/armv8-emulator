import React from 'react';
import BinaryNumber from '@components/binaryNumber';
import styles from '@styles/Encoding.module.css';

function Encoding(props) {
    if (!props.parts) {
        return (
            <div>
                <span className={styles.encoding} data-label={"No instruction active"}>
                    <BinaryNumber value={0} length={32}/>
                </span>
            </div>
        );
    }

    return (
        <div>
            {props.parts.map((part, i) =>
                <span key={`encodingPart${i}`} className={`${styles.encoding} ${styles[part.type]}`} data-label={part.tooltip}>
                    <BinaryNumber value={part.value} length={part.length}/>
                </span>
            )}
        </div>
    );
}

export default Encoding;