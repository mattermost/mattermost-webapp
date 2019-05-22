// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {PropTypes} from 'prop-types';

export default class ChannelMore extends React.PureComponent {
    static propTypes = {
        sectionType: PropTypes.string.isRequired,
        moreChannels: PropTypes.func.isRequired,
        moreDirectMessages: PropTypes.func.isRequired,
        browsePublicDirectChannels: PropTypes.func.isRequired,
    };

    render() {
        const {
            sectionType,
            moreChannels,
            moreDirectMessages,
            browsePublicDirectChannels,
        } = this.props;

        switch (sectionType) {
        case 'public':
            return (
                <li
                    key='public-channel-more'
                    id='morePublicButton'
                >
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
                <li
                    key='dm-more'
                    id='moreDMButton'
                >
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
        case 'recent':
        case 'alpha':
            return (
                <li
                    key='public-dm-more'
                    id='moreRecentAlphaButton'
                >
                    <button
                        id='morePublicDirectChannels'
                        className='nav-more cursor--pointer style--none btn--block'
                        onClick={browsePublicDirectChannels}
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
