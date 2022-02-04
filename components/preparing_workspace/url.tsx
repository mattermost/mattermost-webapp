// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {CSSTransition} from 'react-transition-group';
import {FormattedMessage, useIntl} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import QuickInput from 'components/quick_input';

import Constants from 'utils/constants';

import LaptopEarthSVG from 'components/common/svg_images_components/laptop-earth_svg';

import {Animations, mapAnimationReasonToClass, Form, TransitionProps} from './steps';

import PageLine from './page_line';

import Title from './title';
import Description from './description';

import './url.scss';

function checkUrl(url: string): UrlValidationError | false {
    if (url) {
        return false;
    }
    return UrlValidationErrors.Empty;
}

const UrlValidationErrors = {
    Empty: 'Empty',
    NotUrl: 'NotUrl',
    NoConnection: 'NoConnection',
} as const;
type UrlValidationError = typeof UrlValidationErrors[keyof typeof UrlValidationErrors];

function UrlStatus(props: {tried: boolean; checking: boolean; error: UrlValidationError | false; available: boolean}) {
    const Status = (props: {children: React.ReactNode | React.ReactNodeArray}) => {
        return (
            <div className='Url__status'>
                {props.children}
            </div>
        );
    };
    if (props.available) {
        return (
            <Status>
                <FormattedMessage
                    id={'onboarding_wizard.url.input_valid'}
                    defaultMessage='Test successful. This is a valid URL.'
                />
            </Status>
        );
    }
    if (props.checking) {
        return (
            <Status>
                {'spinner here'}
                <FormattedMessage
                    id={'onboarding_wizard.url.input_testing'}
                    defaultMessage='Testing URL'
                />
            </Status>
        );
    }
    if (!props.checking && !props.tried) {
        return (
            <Status>
                <FormattedMessage
                    id={'onboarding_wizard.url.input_help'}
                    defaultMessage='Standard ports, such as 80 and 443, can be omitted, but non-standard ports are required'
                />
            </Status>
        );
    }

    switch (props.error) {
    default:
        // TODO: Flesh this out in a follow up PR.
        return (
            <Status>
                <FormattedMessage
                    id={'onboarding_wizard.url.input_invalid'}
                    defaultMessage='Test unsuccessful: This is not a valid live URL. Press continue to use anyways.'
                />
            </Status>
        );
    }
}

type Props = TransitionProps & {
    url: Form['url'];
    setUrl: (url: Form['url']) => void;
    className?: string;
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
        if (validation !== false) {
            return;
        }
        props.next?.();
    };
    let className = 'Url-body';
    if (props.className) {
        className += ' ' + props.className;
    }
    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={mapAnimationReasonToClass('Url', props.direction)}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className={className}>
                <div className='Url-left-col'>
                    <PageLine
                        style={{height: '100px'}}
                        noLeft={true}
                    />
                    <LaptopEarthSVG/>
                    <PageLine
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
                            defaultMessage='This is the URL that users will use to access Mattermost. [See Documentation](https://docs.mattermost.com/configure/configuration-settings.html#site-url) for more.'
                        />
                    </Description>
                    <QuickInput
                        placeholder={
                            formatMessage({
                                id: 'onboarding_wizard.url.placeholder',
                                defaultMessage: 'your-workspace',
                            })
                        }
                        value={props.url || ''}
                        onChange={(e) => props.setUrl(e.target.value)}
                        className='Url__input'
                        onKeyUp={onNext}
                        autoFocus={true}
                    />
                    <UrlStatus
                        tried={triedNext}
                        checking={false}
                        error={validation}
                        available={false}
                    />
                    <div>
                        <button
                            className='primary-button'
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
            </div>
        </CSSTransition>
    );
};
export default Url;
