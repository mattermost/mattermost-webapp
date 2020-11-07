// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {Team} from 'mattermost-redux/types/teams';

import {pageVisited, trackEvent} from 'actions/telemetry_actions';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import Input from 'components/input';
import {getAnalyticsCategory} from 'components/next_steps_view/step_helpers';
import PictureSelector from 'components/picture_selector';
import {AcceptedProfileImageTypes} from 'utils/constants';
import * as Utils from 'utils/utils';

import {StepComponentProps} from '../../steps';

import './team_profile_step.scss';

const MAX_TEAM_NAME_LENGTH = 64;

type Props = StepComponentProps & {
    team: Team & {last_team_icon_update?: number};
    siteURL: string;
    maxFileSize: number;
    actions: {
        patchTeam: (team: Team) => void;
        removeTeamIcon: (teamId: string) => void;
        setTeamIcon: (teamId: string, imageData: File) => void;
    };
};

type State = {
    teamName: string;
    teamNameError?: string;
    profilePicture?: File;
    profilePictureError: boolean;
    removeProfilePicture: boolean;
};

export default class TeamProfileStep extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            teamName: props.team.display_name,
            profilePictureError: false,
            removeProfilePicture: false,
        };
    }

    componentDidMount() {
        if (this.props.expanded) {
            pageVisited(getAnalyticsCategory(this.props.isAdmin), 'pageview_name_team');
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.expanded !== this.props.expanded && this.props.expanded) {
            pageVisited(getAnalyticsCategory(this.props.isAdmin), 'pageview_name_team');
        }
    }

    private handleNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let teamNameError;
        if (!event.target.value) {
            teamNameError = Utils.localizeMessage('next_steps_view.team_profile_step.nameCannotBeBlank', 'Team name cannot be blank');
        } else if (event.target.value.length > MAX_TEAM_NAME_LENGTH) {
            teamNameError = Utils.localizeMessage('next_steps_view.team_profile_step.nameTooBig', 'Team name must be less than 64 characters');
        }

        this.setState({teamName: event.target.value, teamNameError});
    }

    isFinishDisabled = () => {
        return Boolean(!this.state.teamName || this.state.teamNameError || this.state.profilePictureError);
    }

    onSkip = () => {
        this.props.onSkip(this.props.id);
    }

    onFinish = () => {
        const team = Object.assign({}, this.props.team, {display_name: this.state.teamName});

        this.props.actions.patchTeam(team);

        if (this.state.profilePicture) {
            this.props.actions.setTeamIcon(this.props.team.id, this.state.profilePicture);
        } else if (this.state.removeProfilePicture) {
            this.props.actions.removeTeamIcon(this.props.team.id);
        }

        trackEvent(getAnalyticsCategory(this.props.isAdmin), 'click_save_team');

        this.props.onFinish(this.props.id);
    }

    onOpenPictureDialog = () => {
        trackEvent(getAnalyticsCategory(this.props.isAdmin), 'click_add_team_image');
    }

    onSelectPicture = (profilePicture: File) => {
        if (!AcceptedProfileImageTypes.includes(profilePicture.type) || profilePicture.size > this.props.maxFileSize) {
            trackEvent(getAnalyticsCategory(this.props.isAdmin), 'error_profile_photo_invalid');

            this.setState({profilePictureError: true});
            return;
        }

        this.setState({profilePicture, profilePictureError: false, removeProfilePicture: false});
    }

    onRemovePicture = () => {
        trackEvent(getAnalyticsCategory(this.props.isAdmin), 'click_remove_photo');

        this.setState({profilePicture: undefined, profilePictureError: false, removeProfilePicture: true});
    }

    render() {
        const {team} = this.props;

        // Make sure picture has been set
        const pictureSrc = team.last_team_icon_update && !this.state.removeProfilePicture ? Utils.imageURLForTeam(team) || undefined : undefined;

        return (
            <div className='NextStepsView__stepWrapper'>
                <div className='TeamProfileStep'>
                    <div className='TeamProfileStep__profilePicture'>
                        <h3>
                            <FormattedMessage
                                id='next_steps_view.team_profile_step.teamImage'
                                defaultMessage='Team image'
                            />
                        </h3>
                        <PictureSelector
                            name='TeamProfileStep__teamIcon'
                            onOpenDialog={this.onOpenPictureDialog}
                            onSelect={this.onSelectPicture}
                            onRemove={this.onRemovePicture}
                            src={pictureSrc}
                            placeholder={(
                                <div
                                    data-testid='teamIconInitial'
                                    className={'TeamIcon__initials TeamIcon__initials__lg'}
                                    aria-label={'Team Initials'}
                                >
                                    {this.props.team.display_name ? this.props.team.display_name.replace(/\s/g, '').substring(0, 2) : '??'}
                                </div>
                            )}
                        />
                    </div>
                    <div className='TeamProfileStep__textInputs'>
                        <h3>
                            <FormattedMessage
                                id='next_steps_view.team_profile_step.enterYourNameAndURL'
                                defaultMessage='Enter your team name'
                            />
                        </h3>
                        <Input
                            name='teamName'
                            type='text'
                            value={this.state.teamName}
                            onChange={this.handleNameInputChange}
                            placeholder={Utils.localizeMessage('next_steps_view.team_profile_step.teamName', 'Team name')}
                            error={this.state.teamNameError}
                            info={Utils.localizeMessage('next_steps_view.team_profile_step.nameWillBeDisplayed', 'Your team name will be displayed in your sidebar')}
                        />
                    </div>
                </div>
                {this.state.profilePictureError &&
                    <span className='TeamProfileStep__pictureError'>
                        <i className='icon icon-alert-outline'/>
                        <FormattedMarkdownMessage
                            id='next_steps_view.team_profile_step.pictureError'
                            defaultMessage='Photos must be in BMP, JPG or PNG format. Maximum file size is {max}.'
                            values={{max: Utils.fileSizeToString(this.props.maxFileSize)}}
                        />
                    </span>
                }
                <div className='NextStepsView__wizardButtons'>
                    <button
                        data-testid='TeamProfileStep__saveTeamButton'
                        className={classNames('NextStepsView__button NextStepsView__finishButton primary', {disabled: this.isFinishDisabled()})}
                        onClick={this.onFinish}
                        disabled={this.isFinishDisabled()}
                    >
                        <FormattedMessage
                            id='next_steps_view.team_profile_step.saveTeam'
                            defaultMessage='Save team'
                        />
                    </button>
                </div>
            </div>
        );
    }
}
