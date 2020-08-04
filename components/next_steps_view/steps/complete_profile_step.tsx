// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import Input from 'components/input';
import PictureSelector from 'components/picture_selector';
import * as Utils from 'utils/utils';

import {StepComponentProps} from '../steps';

import './complete_profile_step.scss';

type Props = StepComponentProps & {
};

type State = {
    fullName: string;
    fullNameError?: string;
    profilePicture?: File;
};

export default class CompleteProfileStep extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            fullName: '',
        };
    }

    private handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({fullName: event.target.value, fullNameError: event.target.value ? 'This is an error.' : undefined});
    }

    onSkip = () => {
        this.props.onSkip(this.props.id);
    }

    onFinish = () => {
        this.props.onFinish(this.props.id);
    }

    onSelectPicture = (profilePicture: File) => {
        this.setState({profilePicture});
    }

    onRemovePicture = () => {
        this.setState({profilePicture: undefined});
    }

    render() {
        const {currentUser} = this.props;

        // Make sure picture has been set
        const pictureSrc = currentUser.last_picture_update ? Utils.imageURLForUser(currentUser.id, currentUser.last_picture_update) : undefined;
        const defaultSrc = Utils.defaultImageURLForUser(currentUser.id);

        return (
            <div>
                <div
                    style={{

                        // TODO temp for textbox demo
                        margin: '24px',
                        minHeight: '200px',
                    }}
                >
                    <Input
                        name='fullName'
                        type='text'
                        value={this.state.fullName}
                        onChange={this.handleInputChange}
                        placeholder={'Your full name'}
                        error={this.state.fullNameError}
                        info={'Your name will be displayed with your messages'}
                    />
                    <PictureSelector
                        onSelect={this.onSelectPicture}
                        onRemove={this.onRemovePicture}
                        src={pictureSrc}
                        defaultSrc={defaultSrc}
                    />
                </div>
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
                        className='NextStepsView__button confirm'
                        onClick={this.onFinish}
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
