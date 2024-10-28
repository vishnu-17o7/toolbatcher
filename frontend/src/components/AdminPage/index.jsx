import React from 'react';
import FeedbackList from '../admin/FeedbackList';
import styles from '../../style';

const AdminPage = () => {
    return (
        <div className="min-h-screen bg-primary">
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidth}`}>
                    <div className="px-4 py-6 sm:px-0">
                        <FeedbackList />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;