// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';

import './icon_message.scss';

type Props = {
    icon: JSX.Element;
    title?: string;
    subtitle?: string;
    date?: string;
    error?: boolean;
    buttonText?: string;
    formattedButonText?: JSX.Element;
    formattedTitle?: JSX.Element;
    formattedSubtitle?: JSX.Element;
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
        formattedButonText,
        formattedTitle,
        formattedSubtitle,
        buttonHandler,
        linkText,
        linkURL,
        footer,
        className,
    } = props;

    let button = null;
    if ((buttonText || formattedButonText) && buttonHandler) {
        button = (
            <div className={classNames('IconMessage-button', error ? 'error' : '')}>
                <button
                    id='login_button'
                    className='btn btn-primary Form-btn'
                    onClick={buttonHandler}
                >
                    {formattedButonText || <FormattedMessage id={buttonText}/>}
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
                {icon}
                <h3 className='IconMessage-h3'>
                    {title ? <FormattedMessage id={title}/> : null}
                    {formattedTitle || null}
                </h3>
                <div className={classNames('IconMessage-sub', error || '')}>
                    {subtitle ? (
                        <FormattedMessage
                            id={subtitle}
                            values={{date}}
                        />
                    ) : null}
                    {formattedSubtitle || null}
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
