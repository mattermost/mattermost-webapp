// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Channel} from '@mattermost/types/channels';
import Menu from 'components/widgets/menu/menu';

type Action = {
    closeRightHandSide: () => void;
    showChannelMembers: (channelId: string, editMembers: boolean) => void;
};

type OwnProps = {
    channel: Channel;
    show: boolean;
    id: string;
    editMembers?: boolean;
    textOpen: string;
    textClose: string;
}

type Props = {
    rhsOpen: boolean;
    actions: Action;
} & OwnProps;

const ToggleChannelMembersRHS = ({
    show,
    id,
    channel,
    rhsOpen,
    textOpen,
    textClose,
    editMembers = false,
    actions,
}: Props) => {
    const toggleRHS = () => {
        if (rhsOpen) {
            actions.closeRightHandSide();
            return;
        }
        actions.showChannelMembers(channel.id, editMembers);
    };

    let text = textOpen;
    if (rhsOpen) {
        text = textClose;
    }

    return (
        <Menu.ItemAction
            show={show}
            id={id}
            onClick={toggleRHS}
            text={text}
        />
    );
};

export default ToggleChannelMembersRHS;
