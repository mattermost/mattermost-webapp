// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Redirect} from 'react-router-dom';
import {Button} from 'react-bootstrap';
import {isSystemAdmin} from 'mattermost-redux/utils/user_utils';

import {trackEvent} from 'actions/diagnostics_actions.jsx';

import {browserHistory} from 'utils/browser_history';

import {StoragePrefixes, SurveyTypes, SignupSurveyTelemetryEvents} from 'utils/constants';

import logoImage from 'images/logo.png';

import SiteNameAndDescription from 'components/common/site_name_and_description';
import RadioSetting, {RadioSettingOptions} from 'components/widgets/settings/radio_setting';

type ValueOf<T> = T[keyof T]; // TODO delete here and use from constants.tsx after pull/5354 is merged

const serverPurposeOptions: RadioSettingOptions = [
    {
        text: (
            <FormattedMessage
                id='signup_survey.server_purpose.short_term'
                defaultMessage={'Just taking a look around, this server probably won\'t live long'}
            />
        ),
        value: SignupSurveyTelemetryEvents.SHORT_TERM,
    },
    {
        text: (
            <FormattedMessage
                id='signup_survey.server_purpose.long_term'
                defaultMessage='Setting this up for the long term'
            />
        ),
        value: SignupSurveyTelemetryEvents.LONG_TERM,
    },
    {
        text: (
            <FormattedMessage
                id='signup_survey.server_purpose.not_sure'
                defaultMessage='Not sure yet'
            />
        ),
        value: SignupSurveyTelemetryEvents.UNSURE,
    },
];

type Props = {
    location: {
        state?: {
            next?: string;
        };
    };
    currentUserId: string;
    currentUserRoles: string;
    signupSurveyUserId: string;
    siteName: string;
    customDescriptionText: string;
    diagnosticsEnabled: boolean;
    actions: {
        removeGlobalItem: Function;
    };
};

type State = {
    serverPurpose: ValueOf<typeof SignupSurveyTelemetryEvents>;
};

export default class SignupSurvey extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            serverPurpose: SignupSurveyTelemetryEvents.NO_RESPONSE,
        };
    }

    serverPurposeOnChange = (name: string, value: ValueOf<typeof SignupSurveyTelemetryEvents>) => {
        this.setState({serverPurpose: value});
    };

    handleSubmit = (e: React.MouseEvent<Button, MouseEvent>) => {
        e.preventDefault();
        const {
            actions: {
                removeGlobalItem,
            },
            location: {
                state: {
                    next = null,
                } = {},
            } = {},
        } = this.props;

        removeGlobalItem(StoragePrefixes.SURVEY + SurveyTypes.SIGNUP);

        trackEvent('signup', this.state.serverPurpose);

        browserHistory.push(next ?? '/');
    };

    render() {
        const {
            siteName,
            customDescriptionText,
            currentUserId,
            currentUserRoles,
            signupSurveyUserId,
            diagnosticsEnabled,
            location: {
                state: {
                    next = null
                } = {},
            } = {},
        } = this.props;

        if (
            !isSystemAdmin(currentUserRoles) ||
            signupSurveyUserId !== currentUserId ||
            !diagnosticsEnabled ||
            next == null
        ) {
            return <Redirect to={next ?? '/'}/>;
        }

        return (
            <div>
                <div className='col-sm-12'>
                    <form className='signup-team__container padding--less'>
                        <img
                            alt={'signup team logo'}
                            className='signup-team-logo'
                            src={logoImage}
                        />
                        <SiteNameAndDescription
                            siteName={siteName}
                            customDescriptionText={customDescriptionText}
                        />
                        <h3>
                            <FormattedMessage
                                id='signup_survey.subtitle'
                                defaultMessage='Almost Done'
                            />
                        </h3>
                        <div className='form-group'>
                            <div className='row'>
                                <div className='col-sm-11'>
                                    <RadioSetting
                                        id='signup_survey_serverPurpose'
                                        label={
                                            <FormattedMessage
                                                id='signup_survey.server_purpose'
                                                defaultMessage='Before we wrap up, will this instance of Mattermost be a test server or something more permanent?'
                                            />
                                        }
                                        options={serverPurposeOptions}
                                        value={this.state.serverPurpose}
                                        onChange={this.serverPurposeOnChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='mt-8'>
                            <Button
                                id='signupSurveyFinishButton'
                                type='submit'
                                bsStyle='primary'
                                onClick={this.handleSubmit}
                            >
                                <FormattedMessage
                                    id='signup_survey.finish'
                                    defaultMessage='Finish'
                                />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
