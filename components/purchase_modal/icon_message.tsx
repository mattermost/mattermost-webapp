// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';

import './icon_message.scss';

type Props = {
    icon: string;
    title: string;
    subtitle?: string;
    date?: string;
    error?: boolean;
    buttonText?: string;
    buttonHandler?: () => void;
    linkText?: string;
    linkURL?: string;
    footer?: JSX.Element;
    className?: string;
}

export default function IconMessage(props: Props) {
    const {
        icon,
        title,
        subtitle,
        date,
        error,
        buttonText,
        buttonHandler,
        linkText,
        linkURL,
        footer,
        className,
    } = props;

    let button = null;
    if (buttonText && buttonHandler) {
        button = (
            <div className={classNames('IconMessage-button', error ? 'error' : '')}>
                <button
                    id='login_button'
                    className='btn btn-primary Form-btn'
                    onClick={buttonHandler}
                >
                    <FormattedMessage
                        id={buttonText}
                    />
                </button>
            </div>
        );
    }

    let link = null;
    if (linkText && linkURL) {
        link = (
            <div className='IconMessage-link'>
                <a
                    href={linkURL}
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    <FormattedMessage
                        id={linkText}
                    />
                </a>
            </div>
        );
    }
    return (
        <div
            id='payment_complete_header'
            className='IconMessage'
        >
            <div className={classNames('content', className || '')}>
                <img
                    className='IconMessage-img'
                    src={icon}
                    alt='Payment icon'
                />
                <h3 className='IconMessage-h3'>
                    <FormattedMessage id={title}/>
                </h3>
                <div className={classNames('IconMessage-sub', error || '')}>
                    {subtitle ? (
                        <FormattedMessage
                            id={subtitle}
                            values={{date}}
                        />
                    ) : null}
                </div>
                {button}
                {link}
                {footer}
            </div>
        </div>
    );
}

IconMessage.defaultProps = {
    error: false,
    subtitle: '',
    date: '',
    className: '',
};
