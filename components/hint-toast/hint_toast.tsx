// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import CloseIcon from 'components/widgets/icons/close_icon';

import './hint_toast.scss';

type Props = {
    children: React.ReactNode;
    onDismiss: () => void;
    width: number;
}

const EXPANDED_TOAST_MAX_CONTAINER_WIDTH = 750;

export const HintToast: React.FC<Props> = ({children, onDismiss, width}: Props) => {
    const handleDismiss = () => {
        if (typeof onDismiss === 'function') {
            onDismiss();
        }
    };

    let toastClassName = 'hint-toast';
    if (width < EXPANDED_TOAST_MAX_CONTAINER_WIDTH) {
        toastClassName += ' hint-toast--expanded';
    }

    return (
        <div className={toastClassName}>
            <div
                className='hint-toast__message'
            >
                {children}
            </div>
            <div
                className='hint-toast__dismiss'
                onClick={handleDismiss}
                data-testid='dismissHintToast'
            >
                <CloseIcon
                    className='close-btn'
                    id='dismissHintToast'
                />
            </div>
        </div>
    );
};
