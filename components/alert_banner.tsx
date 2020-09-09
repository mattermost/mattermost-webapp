// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import './alert_banner.scss';

type Props = {
    mode: 'danger' | 'warning' | 'info';
    title: React.ReactNode;
    message: React.ReactNode;
    className?: string;
    onDismiss?: () => void;
}

const AlertBanner: React.FC<Props> = (props: Props) => {
    const {mode, title, message, className, onDismiss} = props;

    return (
        <div className={classNames('AlertBanner', mode, className)}>
            <div className='AlertBanner__icon'>
                {mode === 'info' &&
                    <i className='icon-alert-circle-outline'/>
                }
                {mode !== 'info' &&
                    <i className='icon-alert-outline'/>
                }
            </div>
            <div className='AlertBanner__body'>
                <div className='AlertBanner__title'>
                    {title}
                </div>
                <div className='AlertBanner__message'>
                    {message}
                </div>
            </div>
            {onDismiss &&
                <button
                    className='AlertBanner__closeButton'
                    onClick={onDismiss}
                >
                    <i className='icon-close'/>
                </button>
            }
        </div>
    );
};

export default AlertBanner;
