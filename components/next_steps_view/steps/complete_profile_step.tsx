// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {StepComponentProps} from '../steps';

type Props = StepComponentProps & {
};

type State = {
};

export default class CompleteProfileStep extends React.PureComponent<Props, State> {
    onSkip = () => {
        this.props.onSkip(this.props.id);
    }

    onFinish = () => {
        this.props.onFinish(this.props.id);
    }

    render() {
        return (
            <div>
                {'AAAAAAAA'}
                <div className='NextStepsView__wizardButtons'>
                    <button
                        className='NextStepsView__button cancel'
                        onClick={this.onSkip}
                    >
                        <FormattedMessage
                            id='next_steps_view.skipForNow'
                            defaultMessage='Skip for now'
                        />
                    </button>
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
