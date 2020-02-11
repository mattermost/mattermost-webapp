// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

type Props = {
    showMoreChannelsModal: () => void;
    showNewChannelModal: () => void;
};

type State = {

};

export default class AddChannelDropdown extends React.PureComponent<Props, State> {
    render() {
        return (
            <div>
                <div>
                    <a
                        href='#'
                        onClick={this.props.showMoreChannelsModal}
                    >
                        <FormattedMessage
                            id={t('sidebar_left.add_channel_dropdown.browseChannels')}
                            defaultMessage={'Browse Channels'}
                        />
                    </a>
                </div>
                <div>
                    <a
                        href='#'
                        onClick={this.props.showNewChannelModal}
                    >
                        <FormattedMessage
                            id={t('sidebar_left.add_channel_dropdown.createNewChannel')}
                            defaultMessage={'Create New Channel'}
                        />
                    </a>
                </div>
            </div>
        );
    }
}
