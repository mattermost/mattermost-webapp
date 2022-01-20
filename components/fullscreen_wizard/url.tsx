// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {CSSTransition} from 'react-transition-group';
import {FormattedMessage, useIntl} from 'react-intl';
import {Animations, mapAnimationReasonToClass, Form, TransitionProps} from './steps'
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import QuickInput from 'components/quick_input';

import PageLine from './page_line';

import LaptopEarthSVG from './laptop-earth.svg';

import './url.scss';

type Props = TransitionProps & {
    url: Form['url'];
    setUrl: (url: Form['url']) => void;
}

const Url = (props: Props) => {
    const {formatMessage} = useIntl();
    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={mapAnimationReasonToClass('Url', props.direction)}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className="Url-body">
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
                    <FormattedMessage
                        id={'onboarding_wizard.url.title'}
                        defaultMessage="Confirm your server's URL"
                    />
                    <FormattedMarkdownMessage
                        id={'onboarding_wizard.url.description'}
                        defaultMessage="This is the URL that users will use to access Mattermost. [See Documentation](https://TODO) for more."
                    />
                    <QuickInput
                        placeholder={
                            formatMessage({
                                id: 'onboarding_wizard.url.placeholder',
                                defaultMessage: 'TODO: URL',
                            })
                        }
                        value={props.url || ''}
                        onChange={(e) => props.setUrl(e.target.value)}
                    />
                    <FormattedMessage
                        id={'onboarding_wizard.url.input_help'}
                        defaultMessage="Standard ports, such as 80 and 443, can be omitted, but non-standard ports are required"
                    />
                    {'spinner here'}
                    <FormattedMessage
                        id={'onboarding_wizard.url.input_testing'}
                        defaultMessage="Testing URL"
                    />
                    <FormattedMessage
                        id={'onboarding_wizard.url.input_valid'}
                        defaultMessage="Test successful. This is a valid URL."
                    />
                    <FormattedMessage
                        id={'onboarding_wizard.url.input_invalid'}
                        defaultMessage="TODO: Invalid URL"
                    />
                    <FormattedMessage
                        id={'onboarding_wizard.url.input_cant_connect'}
                        defaultMessage="TODO: Unable to connect to URL. Press continue to use anyways."
                    />
                    <button
                        className='btn btn-primary'
                        onClick={props.next}
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
}
export default Url;
