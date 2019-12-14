// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    children: JSX.Element[] | JSX.Element | string;
};

export default class AdminHeader extends React.Component<Props> {
    public render() {
        return (
            <div
                className={'admin-console__header'}
                id={'adminPluginManagementHeader'}
            >
                {this.props.children}
            </div>
        );
    }
}
