// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Constants, ModalIdentifiers} from 'utils/constants';

import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import ChannelMembersModal from 'components/channel_members_modal';

const ViewAndManageMembers = ({channel}) => {
    if (channel.type === Constants.DM_CHANNEL) {
        return null;
    }

    if (channel.type === Constants.GM_CHANNEL) {
        return null;
    }

    return (
        <li role='presentation'>
            <ToggleModalButtonRedux
                role='menuitem'
                modalId={ModalIdentifiers.CHANNEL_MEMBERS}
                dialogType={ChannelMembersModal}
                dialogProps={{channel}}
            >
                <FormattedMessage
                    id='channel_header.viewMembers'
                    defaultMessage='View Members'
                />
            </ToggleModalButtonRedux>
        </li>
    );
};

ViewAndManageMembers.propTypes = {

    /**
     * Object with info about channel
     */
    channel: PropTypes.object.isRequired,
};

export default ViewAndManageMembers;
