import React from "react";
import styles from "../styles/ScrollContent.module.css";

export default class ScrollContent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div className={styles.scroll}>{this.props.children}</div>;
    }
}