// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import ToggleModalButtonRedux from 'components/toggle_modal_button_redux';
import EditChannelHeaderModal from 'components/edit_channel_header_modal';
import {ModalIdentifiers} from 'utils/constants';

const SetChannelHeaderOption = ({channel}) => (
    <li role='presentation'>
        <ToggleModalButtonRedux
            id='editChannelHeader'
            role='menuitem'
            modalId={ModalIdentifiers.EDIT_CHANNEL_HEADER}
            dialogType={EditChannelHeaderModal}
            dialogProps={{channel}}
        >
            <FormattedMessage
                id='channel_header.setHeader'
                defaultMessage='Edit Channel Header'
            />
        </ToggleModalButtonRedux>
    </li>
);

SetChannelHeaderOption.propTypes = {

    /**
     * Object with info about user
     */
    channel: PropTypes.object.isRequired,
};

export default SetChannelHeaderOption;
