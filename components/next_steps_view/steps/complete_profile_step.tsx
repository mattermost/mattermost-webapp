// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import Input from 'components/input';
import {localizeMessage} from 'utils/utils';
import {StepComponentProps} from '../steps';

type Props = StepComponentProps & {
};

type State = {
    fullName: string;
    fullNameError?: string;
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
                    <Input
                        name='fullName'
                        type='text'
                        value={this.state.fullName}
                        onChange={this.handleInputChange}
                        placeholder={'Your full name'}
                        error={this.state.fullNameError}
                    />
                </div>
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
