// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {CSSTransition} from 'react-transition-group';
import {FormattedMessage, useIntl} from 'react-intl';

import QuickInput from 'components/quick_input';

import {BadUrlReasons, teamNameToUrl, TeamNameToURL} from 'utils/url';
import Constants from 'utils/constants';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import OrganizationSVG from 'components/common/svg_images_components/organization-building.svg';

import {Animations, mapAnimationReasonToClass, Form, TransitionProps} from './steps';
import PageLine from './page_line';
import Title from './title';
import Description from './description';

import './organization.scss';

const OrganizationError = (props: {error: TeamNameToURL['error']}): JSX.Element => {
    switch (props.error) {
    case BadUrlReasons.Empty:
        return (
            <FormattedMessage
                id='onboarding_wizard.organization.empty'
                defaultMessage='You must enter an organization name'
            />
        );
    case BadUrlReasons.Length:
        return (
            <FormattedMarkdownMessage
                id='onboarding_wizard.organization.length'
                defaultMessage='Organization name must be between {min} and {max} characters'
                values={{
                    min: Constants.MIN_TEAMNAME_LENGTH,
                    max: Constants.MAX_TEAMNAME_LENGTH,
                }}
            />
        );
    case BadUrlReasons.Reserved:
        return (
            <FormattedMessage
                id='onboarding_wizard.organization.reserved'
                defaultMessage='Organization name may not [start with a reserved word](!https://docs.mattermost.com/messaging/creating-teams.html#team-url).'
            />
        );
    default:
        return (
            <FormattedMessage
                id='onboarding_wizard.organization.other'
                defaultMessage='Invalid organization name: {reason}'
                values={{
                    reason: props.error,
                }}
            />
        );
    }
};

type Props = TransitionProps & {
    organization: Form['organization'];
    setOrganization: (organization: Form['organization']) => void;
    className?: string;
}

const Organization = (props: Props) => {
    const {formatMessage} = useIntl();
    const [triedNext, setTriedNext] = useState(false);
    const validation = teamNameToUrl(props.organization || '');

    const onNext = (e?: React.KeyboardEvent | React.MouseEvent) => {
        if (e && (e as React.KeyboardEvent).key) {
            if ((e as React.KeyboardEvent).key !== Constants.KeyCodes.ENTER[0]) {
                return;
            }
        }
        if (!triedNext) {
            setTriedNext(true);
        }

        if (validation.error) {
            return;
        }
        props.next?.();
    };

    let validationHint = null;
    if (triedNext && validation.error !== false) {
        validationHint = <OrganizationError error={validation.error}/>;
    }

    let className = 'Organization-body';
    if (props.className) {
        className += ' ' + props.className;
    }
    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={mapAnimationReasonToClass('Organization', props.direction)}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className={className}>
                <div className='Organization-left-col'>
                    <OrganizationSVG/>
                    <PageLine
                        style={{
                            marginTop: '5px',
                            height: 'calc(100vh - 311px)',
                        }}
                        noLeft={true}
                    />
                </div>
                <div className='Organization-form-wrapper'>
                    {props.previous}
                    <Title>
                        <FormattedMessage
                            id={'onboarding_wizard.organization.title'}
                            defaultMessage="What's the name of your organization?"
                        />
                    </Title>
                    <Description>
                        <FormattedMessage
                            id={'onboarding_wizard.organization.description'}
                            defaultMessage="We'll use this to help personalize your workspace."
                        />
                    </Description>
                    <QuickInput
                        placeholder={
                            formatMessage({
                                id: 'onboarding_wizard.organization.placeholder',
                                defaultMessage: 'Organization name',
                            })
                        }
                        className='Organization__input'
                        value={props.organization || ''}
                        onChange={(e) => props.setOrganization(e.target.value)}
                        onKeyUp={onNext}
                        autoFocus={true}
                    />
                    {validationHint}
                    <div>
                        <button
                            className='primary-button'
                            onClick={onNext}
                            disabled={!props.organization}
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
export default Organization;
