// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {NotificationCategory} from './types';

import './category.scss';

type Props = {
    category: NotificationCategory;
}

type State = {
};

export default class Category extends React.Component<Props, State> {
    render() {
        const {category} = this.props;

        const numNotifications = category.notifications.length;

        return (
            <button className='CategoryIcon animating'>
                <i className={'fa ' + category.icon}>
                    <span className='CategoryCount'>{numNotifications}</span>
                </i>
            </button>
        );
    }
}
