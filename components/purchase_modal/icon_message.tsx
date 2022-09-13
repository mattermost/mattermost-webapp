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
    tertiaryBtnText?: string;
    formattedButtonText?: JSX.Element;
    formattedTertiaryButonText?: JSX.Element;
    formattedTitle?: JSX.Element;
    formattedSubtitle?: JSX.Element;
    buttonHandler?: () => void;
    tertiaryButtonHandler?: () => void;
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
        tertiaryBtnText,
        formattedButtonText,
        formattedTertiaryButonText,
        formattedTitle,
        formattedSubtitle,
        buttonHandler,
        tertiaryButtonHandler,
        linkText,
        linkURL,
        footer,
        className,
    } = props;

    let button = null;
    if ((buttonText || formattedButtonText) && buttonHandler) {
        button = (
            <div className={classNames('IconMessage-button', error ? 'error' : '')}>
                <button
                    className='btn btn-primary Form-btn'
                    onClick={buttonHandler}
                >
                    {formattedButtonText || <FormattedMessage id={buttonText}/>}
                </button>
            </div>
        );
    }

    let tertiaryBtn = null;
    if ((tertiaryBtnText || formattedTertiaryButonText) && tertiaryButtonHandler) {
        tertiaryBtn = (
            <div className={classNames('IconMessage-tertiary-button', error ? 'error' : '')}>
                <button
                    className='btn Form-btn'
                    onClick={tertiaryButtonHandler}
                >
                    {formattedTertiaryButonText || <FormattedMessage id={tertiaryBtnText}/>}
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
                <div className='IconMessage__svg-wrapper'>
                    {icon}
                </div>
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
                <div className='IconMessage-buttons'>
                    {tertiaryBtn}
                    {button}
                </div>
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
