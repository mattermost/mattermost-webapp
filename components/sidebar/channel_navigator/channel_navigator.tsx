// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {ModalIdentifiers} from 'utils/constants';
import QuickSwitchModal from 'components/quick_switch_modal';

import * as Utils from 'utils/utils';
import {isDesktopApp} from 'utils/user_agent';

type Props = {
    canGoForward: boolean;
    canGoBack: boolean;
    actions: {
        openModal: (modalData: any) => Promise<{data: boolean}>;
        goBack: () => void;
        goForward: () => void;
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
        this.props.actions.goBack();
    }

    goForward = () => {
        this.props.actions.goForward();
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
                    <button
                        className={classNames('SidebarChannelNavigator_backButton', {disabled: !this.props.canGoBack})}
                        disabled={!this.props.canGoBack}
                        onClick={this.goBack}
                    >
                        <i className='icon icon-arrow-left'/>
                    </button>
                    <button
                        className={classNames('SidebarChannelNavigator_forwardButton', {disabled: !this.props.canGoForward})}
                        disabled={!this.props.canGoForward}
                        onClick={this.goForward}
                    >
                        <i className='icon icon-arrow-left icon-flip'/>
                    </button>
                </React.Fragment>
            );
        }

        return (
            <div className={'SidebarChannelNavigator'}>
                <button
                    className={'SidebarChannelNavigator_jumpToButton'}
                    onClick={this.openQuickSwitcher}
                >
                    <FormattedMessage
                        id='sidebar_left.channel_navigator.jumpTo'
                        defaultMessage='Jump to...'
                    />
                    <div className={'SidebarChannelNavigator_shortcutText'}>
                        {channelSwitchTextShortcutDefault}
                    </div>
                </button>
                {historyArrows}
            </div>
        );
    }
}
