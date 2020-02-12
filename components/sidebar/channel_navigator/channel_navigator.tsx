// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ModalIdentifiers} from 'utils/constants';
import QuickSwitchModal from 'components/quick_switch_modal';

import * as Utils from 'utils/utils';
import {isDesktopApp} from 'utils/user_agent';

type Props = {
    actions: {
        openModal: (modalData: any) => Promise<{data: boolean}>;
    };
};

type State = {

};

export default class ChannelNavigator extends React.PureComponent<Props, State> {
    openQuickSwitcher = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        this.props.actions.openModal({
            modalId: ModalIdentifiers.QUICK_SWITCH,
            dialogType: QuickSwitchModal,
        });
    }

    goBack = () => {
    }

    goForward = () => {
    }

    render() {
        let channelSwitchTextShortcutDefault = 'CTRL+K';
        if (Utils.isMac()) {
            channelSwitchTextShortcutDefault = '⌘K';
        }

        let historyArrows;
        if (isDesktopApp()) {
            historyArrows = (
                <React.Fragment>
                    <button onClick={this.goBack}>
                        {'<='}
                    </button>
                    <button onClick={this.goForward}>
                        {'=>'}
                    </button>
                </React.Fragment>
            );
        }

        return (
            <div style={{display: 'flex'}}>
                <button
                    onClick={this.openQuickSwitcher}
                    style={{display: 'flex', width: '100%'}}
                >
                    <FormattedMessage
                        id='sidebar_left.channel_navigator.jumpTo'
                        defaultMessage='Jump to...'
                    />
                    <div>
                        {channelSwitchTextShortcutDefault}
                    </div>
                </button>
                {historyArrows}
            </div>
        );
    }
}
