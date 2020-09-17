// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './icon_message.css';

type Props = {
    icon: string;
    title: string;
    subtitle: string;
    error?: string;
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
            <div className='IconMessage-button'>
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
            <div className='IconMessage-sub'>
                {subtitle}
            </div>
            <div className='IconMessage-error'>
                {error}
            </div>
            {button}
            {link}
            {footer}
        </div>
    );
}
