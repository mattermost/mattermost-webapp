// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import EditIcon from 'components/widgets/icons/fa_edit_icon';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import ToggleModalButton from 'components/toggle_modal_button';
import {ModalIdentifiers} from 'utils/constants';
import {Channel} from '@mattermost/types/channels';
import * as Utils from 'utils/utils';

type Props = {
    channel: Channel;
}

const SetHeaderButton = ({channel}: Props) => {
    const channelIsArchived = channel.delete_at !== 0;
    if (channelIsArchived) {
        return null;
    }

    return (
        <ToggleModalButton
            modalId={ModalIdentifiers.EDIT_CHANNEL_HEADER}
            ariaLabel={Utils.localizeMessage('intro_messages.setHeader', 'Set a Header')}
            className={'intro-links color--link channelIntroButton'}
            dialogType={EditChannelHeaderModal}
            dialogProps={{channel}}
        >
            <EditIcon/>
            <FormattedMessage
                id='intro_messages.setHeader'
                defaultMessage='Set a Header'
            />
        </ToggleModalButton>
    );
};

export default React.memo(SetHeaderButton);
