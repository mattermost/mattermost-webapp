// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

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
                        {'Browse Channels'}
                    </a>
                </div>
                <div>
                    <a
                        href='#'
                        onClick={this.props.showNewChannelModal}
                    >
                        {'Create New Channel'}
                    </a>
                </div>
            </div>
        );
    }
}
