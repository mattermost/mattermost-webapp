// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {UserProfile} from 'mattermost-redux/types/users';

import {pageVisited, trackEvent} from 'actions/telemetry_actions';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import {getAnalyticsCategory} from 'components/next_steps_view/step_helpers';
import Input from 'components/input';
import PictureSelector from 'components/picture_selector';
import {AcceptedProfileImageTypes} from 'utils/constants';
import * as Utils from 'utils/utils';

import {StepComponentProps} from '../../steps';

import './complete_profile_step.scss';

const MAX_FULL_NAME_LENGTH = 128;
const MAX_NAME_PART_LENGTH = 64;

type Props = StepComponentProps & {
    maxFileSize: number;
    actions: {
        updateMe: (user: UserProfile) => void;
        setDefaultProfileImage: (userId: string) => void;
        uploadProfileImage: (userId: string, imageData: File) => void;
    };
};

type State = {
    fullName: string;
    fullNameError?: string;
    profilePicture?: File;
    profilePictureError: boolean;
    removeProfilePicture: boolean;
};

export default class CompleteProfileStep extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        const user = props.currentUser;

        this.state = {
            fullName: (user.first_name || user.last_name) ? `${user.first_name} ${user.last_name}` : '',
            profilePictureError: false,
            removeProfilePicture: false,
        };
    }

    componentDidMount() {
        if (this.props.expanded) {
            pageVisited(getAnalyticsCategory(this.props.isAdmin), 'pageview_complete_profile');
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.expanded !== this.props.expanded && this.props.expanded) {
            pageVisited(getAnalyticsCategory(this.props.isAdmin), 'pageview_complete_profile');
        }
    }

    private handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let fullNameError;
        if (!event.target.value) {
            fullNameError = Utils.localizeMessage('next_steps_view.complete_profile_step.fullNameCannotBeBlank', 'Your full name cannot be blank');
        } else if (event.target.value.length > MAX_FULL_NAME_LENGTH) {
            fullNameError = Utils.localizeMessage('next_steps_view.complete_profile_step.fullNameTooBig', 'Your name must be less than 128 character');
        }

        this.setState({fullName: event.target.value, fullNameError});
    }

    isFinishDisabled = () => {
        return Boolean(!this.state.fullName || this.state.fullNameError || this.state.profilePictureError);
    }

    onSkip = () => {
        this.props.onSkip(this.props.id);
    }

    onFinish = () => {
        const splitName = this.state.fullName.split(' ');
        const firstName = splitName[0].slice(0, MAX_NAME_PART_LENGTH);
        const lastName = splitName.slice(1).join(' ').slice(0, MAX_NAME_PART_LENGTH);
        const user = Object.assign({}, this.props.currentUser, {first_name: firstName, last_name: lastName});

        this.props.actions.updateMe(user);

        if (this.state.profilePicture) {
            this.props.actions.uploadProfileImage(this.props.currentUser.id, this.state.profilePicture);
        } else if (this.state.removeProfilePicture) {
            this.props.actions.setDefaultProfileImage(this.props.currentUser.id);
        }

        trackEvent(getAnalyticsCategory(this.props.isAdmin), 'click_save_profile');

        this.props.onFinish(this.props.id);
    }

    onOpenPictureDialog = () => {
        trackEvent(getAnalyticsCategory(this.props.isAdmin), 'click_add_profile_photo');
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
        const {currentUser} = this.props;

        // Make sure picture has been set
        const pictureSrc = currentUser.last_picture_update ? Utils.imageURLForUser(currentUser.id, currentUser.last_picture_update) : undefined;
        const defaultSrc = Utils.defaultImageURLForUser(currentUser.id);

        return (
            <div className='NextStepsView__stepWrapper'>
                <div className='CompleteProfileStep'>
                    <div className='CompleteProfileStep__profilePicture'>
                        <h3>
                            <FormattedMessage
                                id='next_steps_view.complete_profile_step.addAPhoto'
                                defaultMessage='Add a photo'
                            />
                        </h3>
                        <PictureSelector
                            name='CompleteProfileStep__profilePicture'
                            onOpenDialog={this.onOpenPictureDialog}
                            onSelect={this.onSelectPicture}
                            onRemove={this.onRemovePicture}
                            src={pictureSrc}
                            defaultSrc={defaultSrc}
                        />
                    </div>
                    <div className='CompleteProfileStep__fullName'>
                        <h3>
                            <FormattedMessage
                                id='next_steps_view.complete_profile_step.enterYourName'
                                defaultMessage='Enter your name'
                            />
                        </h3>
                        <Input
                            name='fullName'
                            type='text'
                            value={this.state.fullName}
                            onChange={this.handleInputChange}
                            placeholder={Utils.localizeMessage('next_steps_view.complete_profile_step.yourFullName', 'Your full name')}
                            error={this.state.fullNameError}
                            info={Utils.localizeMessage('next_steps_view.complete_profile_step.nameWillBeDisplayed', 'Your name will be displayed with your messages')}
                        />
                    </div>
                </div>
                {this.state.profilePictureError &&
                    <span className='CompleteProfileStep__pictureError'>
                        <i className='icon icon-alert-outline'/>
                        <FormattedMarkdownMessage
                            id='next_steps_view.complete_profile_step.pictureError'
                            defaultMessage='Photos must be in BMP, JPG or PNG format. Maximum file size is {max}.'
                            values={{max: Utils.fileSizeToString(this.props.maxFileSize)}}
                        />
                    </span>
                }
                <div className='NextStepsView__wizardButtons'>
                    <button
                        data-testid='CompleteProfileStep__saveProfileButton'
                        className={classNames('NextStepsView__button NextStepsView__finishButton primary', {disabled: this.isFinishDisabled()})}
                        onClick={this.onFinish}
                        disabled={this.isFinishDisabled()}
                    >
                        <FormattedMessage
                            id='next_steps_view.complete_profile_step.saveProfile'
                            defaultMessage='Save profile'
                        />
                    </button>
                </div>
            </div>
        );
    }
}
