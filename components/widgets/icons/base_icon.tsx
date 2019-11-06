// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './base_icon.scss';

type Props = {
    size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    iconClass: string;
    componentClass: string;
    ariaLabel?: string;
    title: string;
}

export default class BaseIcon extends React.PureComponent<Props> {
    public render() {
        return (
            <i
                className={`Icon Icon-size-${this.props.size} ${this.props.iconClass} ${this.props.componentClass}`}
                title={this.props.title}
            />
        );
    }
}

