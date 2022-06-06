// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import './alert_banner.scss';

export type ModeType = 'danger' | 'warning' | 'info' | 'success';

export type AlertBannerProps = {
    mode: ModeType;
    title?: React.ReactNode;
    message?: React.ReactNode;
    className?: string;
    hideIcon?: boolean;
    actionButtonLeft?: React.ReactNode;
    actionButtonRight?: React.ReactNode;
    onDismiss?: () => void;
    variant?: 'sys' | 'app';
}

const AlertBanner = ({
    mode,
    title,
    message,
    className,
    variant = 'sys',
    onDismiss,
    actionButtonLeft,
    actionButtonRight,
    hideIcon,
}: AlertBannerProps) => (
    <div
        className={classNames(
            'AlertBanner',
            mode,
            className,
            `AlertBanner--${variant}`,
        )}
    >
        {!hideIcon && (
            <div className='AlertBanner__icon'>
                <i
                    className={classNames({
                        'icon-alert-outline':
                            mode === 'danger' || mode === 'warning',
                        'icon-check': mode === 'success',
                        'icon-alert-circle-outline': mode === 'info',
                    })}
                />
            </div>
        )}
        <div className='AlertBanner__body'>
            {title && <div className='AlertBanner__title'>{title}</div>}
            {message && (
                <div
                    className={classNames({
                        AlertBanner__message: Boolean(title),
                    })}
                >
                    {message}
                </div>
            )}
            {(actionButtonLeft || actionButtonRight) && (
                <div className='AlertBanner__actionButtons'>
                    {actionButtonLeft}
                    {actionButtonRight}
                </div>
            )}
        </div>
        {onDismiss && (
            <button
                className='AlertBanner__closeButton'
                onClick={onDismiss}
            >
                <i className='icon-close'/>
            </button>
        )}
    </div>
);

export default AlertBanner;
