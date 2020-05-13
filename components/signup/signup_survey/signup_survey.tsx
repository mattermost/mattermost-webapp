// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {RouteComponentProps, Redirect} from 'react-router-dom';
import {Button} from 'react-bootstrap';

import {trackEvent} from 'actions/diagnostics_actions.jsx';

import {StoragePrefixes} from 'utils/constants';

import logoImage from 'images/logo.png';

import SiteNameAndDescription from 'components/common/site_name_and_description';
import RadioSetting from 'components/widgets/settings/radio_setting';

const SurveyTelemetryEvents = {
    SHORT_TERM: 'survey_short_term',
    LONG_TERM: 'survey_long_term',
    UNSURE: 'survey_unsure',
};

const serverPurposeOptions = [
    {
        text: (
            <FormattedMessage
                id='signup_survey.server_purpose.short_term'
                defaultMessage={'Just taking a look around, this server probably won\'t live long'}
            />
        ),
        value: SurveyTelemetryEvents.SHORT_TERM,
    },
    {
        text: (
            <FormattedMessage
                id='signup_survey.server_purpose.long_term'
                defaultMessage='Setting this up for the long term'
            />
        ),
        value: SurveyTelemetryEvents.LONG_TERM,
    },
    {
        text: (
            <FormattedMessage
                id='signup_survey.server_purpose.not_sure'
                defaultMessage='Not sure yet'
            />
        ),
        value: SurveyTelemetryEvents.UNSURE,
    },
];

type Props = {
    currentUserId: string;
    currentUserRoles: string;
    currentUserIsGuest: boolean;
    siteName: string;
    customDescriptionText: string;
} & RouteComponentProps<{}, {}, LocationState>;

type State = {
    serverPurpose: TelemetryEventName | '';
};

type LocationState = {
    next: string;
};

// TODO use ValueOf<T> once available from mattermost/mattermost-webapp/pull/5354
type TelemetryEventName = 'survey_short_term' | 'survey_long_term' | 'survey_unsure';

export default class SignupSurvey extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            serverPurpose: '',
        };
    }

    serverPurposeOnChange = (name: string, value: any) => {
        this.setState({serverPurpose: value});
    };

    handleSubmit = (e: React.MouseEvent<Button, MouseEvent>) => {
        e.preventDefault();
        sessionStorage.removeItem(StoragePrefixes.SIGNUP_SURVEY);

        if (this.state.serverPurpose) {
            trackEvent('signup', this.state.serverPurpose);
        }
        this.props.history.push(this.props.location?.state?.next);
    };

    render() {
        const {
            siteName,
            customDescriptionText,
            currentUserRoles,
            location: {
                state: {
                    next,
                } = {},
            } = {},
        } = this.props;

        if (!currentUserRoles.includes('system_admin') || next == null) {
            return <Redirect to={next || '/'}/>;
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
                                id='teamURLFinishButton'
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
