// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {Team} from 'mattermost-redux/types/teams';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import Input from 'components/input';
import PictureSelector from 'components/picture_selector';
import {AcceptedProfileImageTypes} from 'utils/constants';
import * as Utils from 'utils/utils';

import {StepComponentProps} from '../../steps';

import './team_profile_step.scss';

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
    teamURL: string;
    teamURLError?: string;
    profilePicture?: File;
    profilePictureError: boolean;
    removeProfilePicture: boolean;
};

export default class TeamProfileStep extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            teamName: props.team.display_name,
            teamURL: props.team.name,
            profilePictureError: false,
            removeProfilePicture: false,
        };
    }

    private handleNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let teamNameError;
        if (!event.target.value) {
            teamNameError = Utils.localizeMessage('next_steps_view.team_profile_step.nameCannotBeBlank', 'Team name can’t be blank');
        }

        this.setState({teamName: event.target.value, teamNameError});
    }

    private handleURLInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let teamURLError;
        if (!event.target.value) {
            teamURLError = Utils.localizeMessage('next_steps_view.team_profile_step.nameCannotBeBlank', 'Team URL can’t be blank');
        }

        const urlRegex = /^[a-z]+([a-z\-0-9]+|(__)?)[a-z0-9]+$/g;
        if (!urlRegex.test(event.target.value)) {
            teamURLError = Utils.localizeMessage('next_steps_view.team_profile_step.malformedURL', 'Use only lower case letters, numbers and dashes. Must start with a letter and can\'t end in a dash.');
        }

        this.setState({teamURL: event.target.value, teamURLError});
    }

    isFinishDisabled = () => {
        return Boolean(!this.state.teamName || this.state.teamNameError || !this.state.teamURL || this.state.teamURLError || this.state.profilePictureError);
    }

    getSanitizedSiteURL = () => {
        const removeProtocol = this.props.siteURL.replace(/(^\w+:|^)\/\//, '');
        if (removeProtocol.endsWith('/')) {
            return removeProtocol;
        }

        return `${removeProtocol}/`;
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

        this.props.onFinish(this.props.id);
    }

    onSelectPicture = (profilePicture: File) => {
        if (!AcceptedProfileImageTypes.includes(profilePicture.type) || profilePicture.size > this.props.maxFileSize) {
            this.setState({profilePictureError: true});
            return;
        }

        this.setState({profilePicture, profilePictureError: false, removeProfilePicture: false});
    }

    onRemovePicture = () => {
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
                <span className='TeamProfileStep__pictureError'>
                    {this.state.profilePictureError && (
                        <>
                            <i className='icon icon-alert-outline'/>
                            <FormattedMarkdownMessage
                                id='next_steps_view.team_profile_step.pictureError'
                                defaultMessage='Photos must be in BMP, JPG or PNG format. Maximum file size is {max}.'
                                values={{max: Utils.fileSizeToString(this.props.maxFileSize)}}
                            />
                        </>
                    )}
                </span>
                <div className='NextStepsView__wizardButtons'>
                    {/* <button
                        className='NextStepsView__button cancel'
                        onClick={this.onSkip}
                    >
                        <FormattedMessage
                            id='next_steps_view.skipForNow'
                            defaultMessage='Skip for now'
                        />
                    </button> */}
                    <button
                        className={classNames('NextStepsView__button confirm', {disabled: this.isFinishDisabled()})}
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
