// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './cloud_announcement_bar.scss';
type Props = {
    userLimit: string;
    userIsAdmin: boolean;
    isCloud: boolean;
    actions: {
        closeModal: () => void;
    };
};

export default class CloudAnnouncementBar extends React.PureComponent<Props> {
    componentDidMount() {
    }

    render() {
        const closeButton = (
            <a
                href='#'
                className='announcement-bar__close'
            >
                {'×'}
            </a>
        );
        return (
            <div
                className={'announcement-bar cloud'}
            >
                {'You\'ve reached the user limit of the free tier'}
                <button
                    className='upgrade-button'
                >
                    {'Upgrade Mattermost Cloud'}
                </button>
                {closeButton}
            </div>
        );
    }
}
