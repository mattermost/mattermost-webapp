// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {CSSTransition} from 'react-transition-group';
import {FormattedMessage, useIntl} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import QuickInput from 'components/quick_input';

import Constants from 'utils/constants';

import {Animations, mapAnimationReasonToClass, Form, TransitionProps} from './steps';

import PageLine from './page_line';

import LaptopEarthSVG from './laptop-earth.svg';

import Title from './title';
import Description from './description';

import './url.scss';

type Props = TransitionProps & {
    url: Form['url'];
    setUrl: (url: Form['url']) => void;
}

function checkUrl(url: string): UrlValidationError | false {
    if (url) {
        return false;
    }
    return UrlValidationErrors.Empty;
}

const UrlValidationErrors = {
    Empty: 'Empty',
    NotUrl: 'NotUrl',
    Taken: 'Taken',
    NoConnection: 'NoConnection',
} as const;
type UrlValidationError = typeof UrlValidationErrors[keyof typeof UrlValidationErrors];

function UrlCheckStatus(props: {tried: boolean; checking: boolean; error: UrlValidationError | false; available: boolean}) {
    if (props.available) {
        return (
            <FormattedMessage
                id={'onboarding_wizard.url.input_valid'}
                defaultMessage='Test successful. This is a valid URL.'
            />
        );
    }
    if (props.checking) {
        return (
            <span>
                {'spinner here'}
                <FormattedMessage
                    id={'onboarding_wizard.url.input_testing'}
                    defaultMessage='Testing URL'
                />
            </span>
        );
    }
    if (!props.checking && !props.tried) {
        return null;
    }
    switch (props.error) {
    case UrlValidationErrors.Empty:
        return (
            <FormattedMessage
                id={'onboarding_wizard.url.input_invalid'}
                defaultMessage='TODO: Invalid URL'
            />
        );
    case UrlValidationErrors.NoConnection:
        return (
            <FormattedMessage
                id={'onboarding_wizard.url.input_cant_connect'}
                defaultMessage='TODO: Unable to connect to URL. Press continue to use anyways.'
            />
        );
    case UrlValidationErrors.Taken:
        return (
            <FormattedMessage
                id={'onboarding_wizard.url.input_taken'}
                defaultMessage='TODO: This URL is already taken.'
            />
        );
    default:
        return (
            <FormattedMessage
                id={'onboarding_wizard.url.input_invalid'}
                defaultMessage='TODO: Invalid URL'
            />
        );
    }
}

const Url = (props: Props) => {
    const {formatMessage} = useIntl();
    const [triedNext, setTriedNext] = useState(false);
    const validation = checkUrl(props.url || '');
    const onNext = async (e?: React.KeyboardEvent | React.MouseEvent) => {
        if (e && (e as React.KeyboardEvent).key) {
            if ((e as React.KeyboardEvent).key !== Constants.KeyCodes.ENTER[0]) {
                return;
            }
        }
        setTriedNext(true);
        if (validation === false) {
            return;
        }
        props.next?.();
    };
    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={mapAnimationReasonToClass('Url', props.direction)}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className='Url-body'>
                <div className='Url-left-col'>
                    <PageLine
                        height={'100px'}
                        noLeft={true}
                    />
                    <LaptopEarthSVG/>
                    <PageLine
                        height={'calc(100vh - 250px)'}
                        noLeft={true}
                    />
                </div>
                <div className='Url-form-wrapper'>
                    {props.previous}
                    <Title>
                        <FormattedMessage
                            id={'onboarding_wizard.url.title'}
                            defaultMessage="Confirm your server's URL"
                        />
                    </Title>
                    <Description>
                        <FormattedMarkdownMessage
                            id={'onboarding_wizard.url.description'}
                            defaultMessage='This is the URL that users will use to access Mattermost. [See Documentation](https://TODO) for more.'
                        />
                    </Description>
                    <QuickInput
                        placeholder={
                            formatMessage({
                                id: 'onboarding_wizard.url.placeholder',
                                defaultMessage: 'TODO: URL',
                            })
                        }
                        value={props.url || ''}
                        onChange={(e) => props.setUrl(e.target.value)}
                        className='Url__input'
                        onKeyUp={onNext}
                        autoFocus={true}
                    />
                    <FormattedMessage
                        id={'onboarding_wizard.url.input_help'}
                        defaultMessage='Standard ports, such as 80 and 443, can be omitted, but non-standard ports are required'
                    />
                    <UrlCheckStatus
                        tried={triedNext}
                        checking={false}
                        error={validation}
                        available={false}
                    />
                    <button
                        className='btn btn-primary'
                        onClick={onNext}
                        disabled={false}
                    >
                        <FormattedMessage
                            id={'onboarding_wizard.next'}
                            defaultMessage='Continue'
                        />
                    </button>
                </div>
            </div>
        </CSSTransition>
    );
};
export default Url;
