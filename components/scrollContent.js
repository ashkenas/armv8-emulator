import React, { useEffect, useRef } from "react";
import styles from "@styles/ScrollContent.module.css";

export default function ScrollContent({ children, height, scrollTop }) {
    const ref = useRef(null);

    useEffect(() => {
        if (ref && ref.current)
            ref.current.scrollTop = scrollTop;
    }, [scrollTop]);

    const auxStyles = {};
    if (height)
        auxStyles.maxHeight = height;

    return (
        <div ref={ref} className={styles.scroll} style={auxStyles}>
            {children}
        </div>
    );
}