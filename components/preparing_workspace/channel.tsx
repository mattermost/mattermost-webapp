// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {CSSTransition} from 'react-transition-group';
import {FormattedMessage, useIntl} from 'react-intl';
import debounce from 'lodash/debounce';

import {channelNameToUrl} from 'utils/url';
import Constants from 'utils/constants';
import QuickInput from 'components/quick_input';
import {trackEvent} from 'actions/telemetry_actions';

import {Animations, mapAnimationReasonToClass, PreparingWorkspacePageProps} from './steps';

import Title from './title';
import Description from './description';
import PageBody from './page_body';
import SingleColumnLayout from './single_column_layout';
import ChannelStatus from './channel_status';

import './channel.scss';

const reportValidationError = debounce(() => {
    trackEvent('first_admin_setup', 'validate_organization_error');
}, 700, {leading: false});

type Props = PreparingWorkspacePageProps & {
    name: string;
    onChange: (newValue: string) => void;
    className?: string;
}
const Channel = (props: Props) => {
    const [triedNext, setTriedNext] = useState(false);
    const validation = channelNameToUrl(props.name);
    const intl = useIntl();
    useEffect(() => {
        if (props.show) {
            props.onPageView();
        }
    }, [props.show]);

    let className = 'Channel-body';
    if (props.className) {
        className += ' ' + props.className;
    }

    const onNext = async (e?: React.KeyboardEvent | React.MouseEvent) => {
        if (e && (e as React.KeyboardEvent).key) {
            if ((e as React.KeyboardEvent).key !== Constants.KeyCodes.ENTER[0]) {
                return;
            }
        }

        if (!triedNext) {
            setTriedNext(true);
        }

        if (validation.error) {
            reportValidationError();
            return;
        }

        props.next?.();
    };

    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={mapAnimationReasonToClass('Channel', props.transitionDirection)}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className={className}>
                <SingleColumnLayout>
                    {props.previous}
                    <Title>
                        <FormattedMessage
                            id={'onboarding_wizard.channel.title'}
                            defaultMessage='Let’s create your first channel'
                        />
                    </Title>
                    <Description>
                        <FormattedMessage
                            id={'onboarding_wizard.channel.description'}
                            defaultMessage='Channels are where you can communicate with your team about a topic or project. What are you working on right now?'
                        />
                    </Description>
                    <PageBody>
                        <QuickInput
                            value={props.name}
                            onChange={(e) => props.onChange(e.target.value)}
                            onKeyUp={onNext}
                            autoFocus={true}
                            className='Channel__input'
                            placeholder={intl.formatMessage({id: 'onboarding_wizard.channel.input', defaultMessage: 'Enter a channel name'})}
                        />
                        <ChannelStatus error={triedNext && validation.error}/>
                    </PageBody>
                    <div>
                        <button
                            className='primary-button'
                            disabled={!props.name}
                            onClick={onNext}
                        >
                            <FormattedMessage
                                id={'onboarding_wizard.next'}
                                defaultMessage='Continue'
                            />
                        </button>
                        <button
                            className='tertiary-button'
                            onClick={props.skip}
                        >
                            <FormattedMessage
                                id={'onboarding_wizard.skip'}
                                defaultMessage='Skip for now'
                            />
                        </button>
                    </div>
                </SingleColumnLayout>
            </div>
        </CSSTransition>
    );
};

export default Channel;
