// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {PropTypes} from 'prop-types';

export default class ChannelMore extends React.PureComponent {
    static propTypes = {
        channelType: PropTypes.string.isRequired,
        moreChannels: PropTypes.func.isRequired,
        moreDirectMessages: PropTypes.func.isRequired,
    };

    render() {
        const {
            channelType,
            moreChannels,
            moreDirectMessages,
        } = this.props;

        switch (channelType) {
        case 'public':
            return (
                <li key='public-channel-more'>
                    <button
                        id='sidebarChannelsMore'
                        className='nav-more cursor--pointer style--none btn--block'
                        onClick={moreChannels}
                    >
                        <FormattedMessage
                            id='sidebar.moreElips'
                            defaultMessage='More...'
                        />
                    </button>
                </li>
            );
        case 'direct':
            return (
                <li key='dm-more'>
                    <button
                        id='moreDirectMessage'
                        className='nav-more cursor--pointer style--none btn--block'
                        onClick={moreDirectMessages}
                    >
                        <FormattedMessage
                            id='sidebar.moreElips'
                            defaultMessage='More...'
                        />
                    </button>
                </li>
            );
        }

        return null;
    }
}
