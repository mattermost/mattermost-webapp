// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {PluginComponent} from 'types/store/plugins';
import {Channel} from '@mattermost/types/channels';
import * as Utils from 'utils/utils';

type Props = {
    channel: Channel;
    boardComponent?: PluginComponent;
}

const BoardsButton = ({channel, boardComponent}: Props) => {
    const channelIsArchived = channel.delete_at !== 0;
    if (channelIsArchived || boardComponent === undefined) {
        return null;
    }

    return (
        <button
            className={'intro-links color--link channelIntroButton style--none'}
            onClick={() => {
                if (boardComponent.action) {
                    boardComponent.action();
                }
            }}
            aria-label={Utils.localizeMessage('intro_messages.createBoard', 'Create a board')}
        >
            {boardComponent.icon}
            <FormattedMessage
                id='intro_messages.createBoard'
                defaultMessage='Create a board'
            />
        </button>
    );
};

export default React.memo(BoardsButton);
