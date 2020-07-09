// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {StepComponentProps} from '../steps';

type Props = StepComponentProps & {
};

type State = {
};

export default class CompleteProfileStep extends React.PureComponent<Props, State> {
    render() {
        return (
            <div>
                {'AAAAAAAA'}
                <button onClick={() => this.props.onFinish(this.props.id)}>{'Finish'}</button>
                <button onClick={() => this.props.onSkip(this.props.id)}>{'Skip'}</button>
            </div>
        );
    }
}