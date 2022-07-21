import styles from '@styles/ErrorBoundary.module.css';
import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: false, errorInfo: false };
    }

    static getDerivedStateFromError(error) {
        return { error: error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error: error, errorInfo: errorInfo });
    }

    render() {
        console.log(this.state);
        if (!this.state.errorInfo)
            return this.props.children;

        return (
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <div className={styles.head}>
                        <h2 className={styles.title}>{this.props.title}</h2>
                    </div>
                    <div className={styles.body}>
                        <p>{this.state.error}</p>
                    </div>
                </div>
            </div>
        );
    }
};
