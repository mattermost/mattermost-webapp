// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Constants, ModalIdentifiers} from 'utils/constants';

import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import ChannelInfoModal from 'components/channel_info_modal';

const ViewChannelInfo = ({channel}) => {
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
                modalId={ModalIdentifiers.CHANNEL_INFO}
                dialogType={ChannelInfoModal}
                dialogProps={{channel}}
            >
                <FormattedMessage
                    id='navbar.viewInfo'
                    defaultMessage='View Info'
                />
            </ToggleModalButtonRedux>
        </li>
    );
};

ViewChannelInfo.propTypes = {

    /**
     * Object with info about channel
     */
    channel: PropTypes.object.isRequired,
};

export default ViewChannelInfo;
