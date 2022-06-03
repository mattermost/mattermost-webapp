// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {useSelector} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {Message} from 'utils/i18n';

import CompassThemeProvider from 'components/compass_theme_provider/compass_theme_provider';
import GenericModal from 'components/generic_modal';
import useGetLimits from 'components/common/hooks/useGetLimits';
import useGetUsage from 'components/common/hooks/useGetUsage';

import WorkspaceLimitsPanel, {messageToElement} from './workspace_limits_panel';

import './index.scss';

interface ModalAction {
    message: Message | React.ReactNode;
    onClick?: () => void;
}
export interface Props {
    title: Message | React.ReactNode;
    description?: Message | React.ReactNode;
    primaryAction?: ModalAction;
    secondaryAction?: ModalAction;
    onClose: () => void;

    // e.g. in contexts where the CompassThemeProvider isn't already applied, like the system console
    needsTheme?: boolean;
}

export default function CloudUsageModal(props: Props) {
    const [limits] = useGetLimits();
    const usage = useGetUsage();
    const theme = useSelector(getTheme);

    const modal = (
        <GenericModal
            handleCancel={props.onClose}
            useCompassDesign={true}
            onExited={props.onClose}
            modalHeaderText={messageToElement(props.title)}
            cancelButtonText={props.secondaryAction && messageToElement(props.secondaryAction.message)}
            handleConfirm={props.primaryAction?.onClick}
            confirmButtonText={props.primaryAction && messageToElement(props.primaryAction.message)}
            className='CloudUsageModal'
        >
            <>
                <p className='CloudUsageModal__description'>
                    {props.description && messageToElement(props.description)}
                </p>
                <WorkspaceLimitsPanel
                    showIcons={true}
                    limits={limits}
                    usage={usage}
                />
            </>
        </GenericModal>
    );

    if (!props.needsTheme) {
        return modal;
    }

    return (
        <CompassThemeProvider theme={theme}>
            {modal}
        </CompassThemeProvider>
    );
}
