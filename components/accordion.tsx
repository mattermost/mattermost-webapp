// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {StepType} from './next_steps_view/steps';

type Props = {
    defaultExpandedKey: string;
    lastNonCompletedStep: StepType;
    children: (setExpanded: (expandedKey: string) => void, expandedKey: string, lastStep: StepType) => React.ReactNode;
};

type State = {
    expandedKey: string;
};

export default class Accordion extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            expandedKey: props.defaultExpandedKey,
        };
    }

    setExpanded = (expandedKey: string) => {
        this.setState({expandedKey});
    }

    render() {
        return (
            <div
                className={'Accordion'}
            >
                {this.props.children(this.setExpanded, this.state.expandedKey, this.props.lastNonCompletedStep)}
            </div>
        );
    }
}
