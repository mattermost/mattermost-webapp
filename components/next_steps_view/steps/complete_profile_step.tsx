// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import PictureSelector from 'components/picture_selector';
import * as Utils from 'utils/utils';

import {StepComponentProps} from '../steps';

type Props = StepComponentProps & {
};

type State = {
    profilePicture?: File;
};

export default class CompleteProfileStep extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {};
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
        return (
            <div>
                <div
                    style={{

                        // TODO temp for textbox demo
                        margin: '24px',
                        minHeight: '200px',
                    }}
                >
                    <PictureSelector
                        onSelect={this.onSelectPicture}
                        onRemove={this.onRemovePicture}
                        src={Utils.imageURLForUser(this.props.currentUser.id, this.props.currentUser.last_picture_update)}
                        defaultSrc={Utils.defaultImageURLForUser(this.props.currentUser.id)}
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
