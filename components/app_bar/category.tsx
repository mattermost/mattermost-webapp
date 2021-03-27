// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {NotificationType} from 'mattermost-redux/types/notifications';

import './category.scss';

type Props = {
    count: number;
    icon: string;
    hoverText: string;
}

type State = {
};

export default class Category extends React.Component<Props, State> {
    render() {
        const {icon, count} = this.props;

        return (
            <button className='CategoryIcon animating'>
                <i className={'fa ' + icon}>
                    <span className='CategoryCount'>{count}</span>
                </i>
            </button>
        );
    }
}
