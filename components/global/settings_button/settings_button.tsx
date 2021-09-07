// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import IconButton from '@mattermost/compass-components/components/icon-button';

import Constants, {ModalIdentifiers} from 'utils/constants';

import OverlayTrigger from 'components/overlay_trigger';
import UserSettingsModal from 'components/user_settings/modal';

type Props = {
    actions: {
        openModal: (params: {modalId: string; dialogType: any; dialogProps: any}) => void;
    };
};

const SettingsButton = (props: Props): JSX.Element | null => {
    const tooltip = (
        <Tooltip id='productSettings'>
            <FormattedMessage
                id='global_header.productSettings'
                defaultMessage='Settings'
            />
        </Tooltip>
    );

    return (
        <OverlayTrigger
            trigger={['hover']}
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='bottom'
            overlay={tooltip}
        >
            <IconButton
                size={'sm'}
                icon={'settings-outline'}
                onClick={(): void => {
                    props.actions.openModal({modalId: ModalIdentifiers.USER_SETTINGS, dialogType: UserSettingsModal, dialogProps: {isContentProductSettings: true}});
                }}
                inverted={true}
                compact={true}
                aria-label='Select to open the settings modal.' // proper wording and translation needed
            />
        </OverlayTrigger>
    );
};

export default SettingsButton;
