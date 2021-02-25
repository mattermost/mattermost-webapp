// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    children: JSX.Element[] | JSX.Element | string;
    className?: string;
};

export default class AdminFooter extends React.PureComponent<Props> {
    public render() {
        return (
            <div className={`admin-console__footer ${this.props.className}`}>
                {this.props.children}
            </div>
        );
    }
}
