// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './badge.scss';

type Props = {
    show: boolean;
    children: React.ReactNode;
    className: string;
};

export default class Badge extends React.Component<Props> {
    public static defaultProps = {
        show: true,
        className: '',
    };

    public render() {
        if (!this.props.show) {
            return null;
        }
        return (
            <div className='Badge'>
                <div className={'Badge__box ' + this.props.className}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}
