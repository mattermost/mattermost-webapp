// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {CSSTransition} from 'react-transition-group';
import {FormattedMessage, useIntl} from 'react-intl';
import {Animations, mapAnimationReasonToClass, Form, TransitionProps} from './steps'

import QuickInput from 'components/quick_input';

import OrganizationSVG from './organization-building.svg';
import PageLine from './page_line';

type Props = TransitionProps & {
    organization: Form['organization'];
    setOrganization: (organization: Form['organization']) => void;
}

import './organization.scss';

const Organization = (props: Props) => {
    const {formatMessage} = useIntl();
    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={mapAnimationReasonToClass('Organization', props.direction)}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className="Organization-body">
                <div className='Organization-left-col'>
                    <PageLine
                        height={'100px'}
                        noLeft={true}
                    />
                    <OrganizationSVG/>
                    <PageLine
                        height={'calc(100vh - 250px)'}
                        noLeft={true}
                    />
                </div>
                <div className='Organization-form-wrapper'>
                    {props.previous}
                    <FormattedMessage
                        id={'onboarding_wizard.organization.title'}
                        defaultMessage="What's the name of your organization?"
                    />
                    <FormattedMessage
                        id={'onboarding_wizard.organization.description'}
                        defaultMessage="We'll use this to help personalize your workspace."
                    />
                    <QuickInput
                        placeholder={
                            formatMessage({
                                id:"onboarding_wizard.organization.placeholder",
                                defaultMessage: "TODO: Organization",
                            })
                        }
                        value={props.organization || ''}
                        onChange={(e) => props.setOrganization(e.target.value)}
                    />
                    <button
                        className='btn btn-primary'
                        onClick={props.next}
                        disabled={!props.organization}
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
export default Organization;
