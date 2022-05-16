// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';
import {CSSTransition} from 'react-transition-group';
import {FormattedMessage, useIntl} from 'react-intl';
import debounce from 'lodash/debounce';

import QuickInput from 'components/quick_input';
import {trackEvent} from 'actions/telemetry_actions';

import Constants from 'utils/constants';

import OrganizationSVG from 'components/common/svg_images_components/organization-building_svg';
import useValidateTeam from 'components/common/hooks/useValidateTeam';

import OrganizationStatus from './organization_status';

import {Animations, mapAnimationReasonToClass, Form, PreparingWorkspacePageProps} from './steps';
import Title from './title';
import Description from './description';
import PageBody from './page_body';
import ProgressPath from './progress_path';
import LeftCol from './left_col';

import './organization.scss';

type Props = PreparingWorkspacePageProps & {
    organization: Form['organization'];
    setOrganization: (organization: Form['organization']) => void;
    className?: string;
}

const reportValidationError = debounce((teamName: string, valid: boolean) => {
    if (!valid && teamName) {
        trackEvent('first_admin_setup', 'validate_organization_error');
    }
}, 700, {leading: false});

const Organization = (props: Props) => {
    const {formatMessage} = useIntl();
    const [userEdited, setUserEdited] = useState(false);
    const teamValidator = useValidateTeam();

    useEffect(() => {
        teamValidator.validate(props.organization || '');
    }, []);

    useEffect(() => {
        if (props.show) {
            props.onPageView();
        }
    }, [props.show]);

    const onNext = (e?: React.KeyboardEvent | React.MouseEvent) => {
        if (e && (e as React.KeyboardEvent).key) {
            if ((e as React.KeyboardEvent).key !== Constants.KeyCodes.ENTER[0]) {
                return;
            }
        }

        if (!userEdited) {
            setUserEdited(true);
        }

        if (teamValidator.verifying) {
            return;
        }
        if (!teamValidator.result.valid) {
            return;
        }
        props.next?.();
    };

    useEffect(() => {
        reportValidationError(props.organization || '', teamValidator.result.valid);
    }, [props.organization, teamValidator.result.valid, teamValidator.result.valid]);

    let className = 'Organization-body';
    if (props.className) {
        className += ' ' + props.className;
    }
    let inputClass = 'Organization__input';

    if (userEdited && !teamValidator.verifying && teamValidator.result.error) {
        inputClass += ' Organization__input--error';
    }
    return (
        <CSSTransition
            in={props.show}
            timeout={Animations.PAGE_SLIDE}
            classNames={mapAnimationReasonToClass('Organization', props.transitionDirection)}
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <div className={className}>
                <LeftCol/>
                <div className='Organization-right-col'>
                    <div className='Organization-form-wrapper'>
                        <ProgressPath
                            style={{top: '-39px'}}
                            beforePath={false}
                        >
                            <OrganizationSVG width={200}/>
                        </ProgressPath>
                        {props.previous}
                        <Title>
                            <FormattedMessage
                                id={'onboarding_wizard.organization.title'}
                                defaultMessage='What’s the name of your organization?'
                            />
                        </Title>
                        <Description>
                            <FormattedMessage
                                id={'onboarding_wizard.organization.description'}
                                defaultMessage='We’ll use this to help personalize your workspace.'
                            />
                        </Description>
                        <PageBody>
                            <QuickInput
                                placeholder={
                                    formatMessage({
                                        id: 'onboarding_wizard.organization.placeholder',
                                        defaultMessage: 'Organization name',
                                    })
                                }
                                className={inputClass}
                                value={props.organization || ''}
                                onChange={(e) => {
                                    props.setOrganization(e.target.value);
                                    teamValidator.validate(e.target.value);
                                    setUserEdited(true);
                                }}
                                onKeyUp={onNext}
                                autoFocus={true}
                            />
                            <OrganizationStatus
                                checking={teamValidator.verifying}
                                error={teamValidator.result.error}
                                userEdited={userEdited}
                            />
                        </PageBody>
                        <div>
                            <button
                                className='primary-button'
                                data-testid='continue'
                                onClick={onNext}
                                disabled={teamValidator.verifying || !teamValidator.result.valid}
                            >
                                <FormattedMessage
                                    id={'onboarding_wizard.next'}
                                    defaultMessage='Continue'
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </CSSTransition>
    );
};
export default Organization;
