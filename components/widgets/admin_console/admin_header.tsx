// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

type Props = {
    children: JSX.Element[] | JSX.Element | string;
    className?: string;
};

export default class AdminHeader extends React.PureComponent<Props> {
    public render() {
        return (
            <div className={classNames('admin-console__header', this.props.className)}>
                {this.props.children}
            </div>
        );
    }
}
