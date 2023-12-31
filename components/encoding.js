import React from 'react';
import BinaryNumber from '@components/binaryNumber';
import styles from '@styles/Encoding.module.css';
import { useSelector } from 'react-redux';

function Encoding(props) {
    const parts = useSelector((state) => state.encoding);

    return (
        <div>
            {parts.map((part, i) =>
                <span key={`encodingPart${i}`} className={`${styles.encoding} ${styles[part.type]}`} data-label={part.tooltip}>
                    <BinaryNumber value={part.value} length={part.length}/>
                </span>
            )}
        </div>
    );
}

export default Encoding;