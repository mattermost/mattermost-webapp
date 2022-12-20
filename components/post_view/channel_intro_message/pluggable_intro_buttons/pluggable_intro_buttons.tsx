// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import {Channel, ChannelMembership} from '@mattermost/types/channels';

import {PluginComponent} from 'types/store/plugins';

type Props = {
    channel: Channel;
    channelMember?: ChannelMembership;
    pluginButtons: PluginComponent[];
}

const PluggableIntroButtons = React.memo((props: Props) => {
    const intl = useIntl();

    const channelIsArchived = props.channel.delete_at !== 0;
    if (channelIsArchived || props.pluginButtons.length === 0) {
        return null;
    }

    const buttons = props.pluginButtons.map((buttonProps) => {
        // text defaults to "Create a board" because the original version of this API had hardcoded text and was
        // built specifically for Boards
        const text = buttonProps.text ?? intl.formatMessage({id: 'intro_messages.createBoard', defaultMessage: 'Create a board'});

        return (
            <button
                key={buttonProps.id}
                className={'intro-links color--link channelIntroButton style--none'}
                onClick={() => buttonProps.action?.(props.channel, props.channelMember)}
                aria-label={text}
            >
                {buttonProps.icon}
                {text}
            </button>
        );
    });

    return <>{buttons}</>;
});
PluggableIntroButtons.displayName = 'PluggableIntroButtons';

export default PluggableIntroButtons;
