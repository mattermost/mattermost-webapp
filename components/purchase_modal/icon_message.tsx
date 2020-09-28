// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import './icon_message.scss';

type Props = {
    icon: string;
    title: string;
    subtitle: string;
    error?: boolean;
    buttonText?: string;
    buttonHandler?: () => void;
    linkText?: string;
    linkURL?: string;
    footer?: JSX.Element;
}

export default function IconMessage(props: Props) {
    const {
        icon,
        title,
        subtitle,
        error,
        buttonText,
        buttonHandler,
        linkText,
        linkURL,
        footer,
    } = props;

    let button = null;
    if (buttonText && buttonHandler) {
        button = (
            <div className={classNames('IconMessage-button', props.error ? 'error' : '')}>
                <button
                    id='login_button'
                    className='btn btn-primary Form-btn'
                    onClick={buttonHandler}
                >
                    {buttonText}
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
                    {linkText}
                </a>
            </div>
        );
    }

    return (
        <div
            id='payment_complete_header'
            className='IconMessage'
        >
            <img
                className='IconMessage-img'
                src={icon}
                alt='Payment icon'
            />
            <h3 className='IconMessage-h3'>
                {title}
            </h3>
            <div className={classNames('IconMessage-sub', props.error ? props.error : '')}>
                {subtitle}
            </div>
            {/* <div className='IconMessage-error'/> */}
            {button}
            {link}
            {footer}
        </div>
    );
}

IconMessage.defaultProps = {
    error: false,
}
