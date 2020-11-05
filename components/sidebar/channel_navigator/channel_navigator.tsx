// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';
import {Tooltip} from 'react-bootstrap';

import {trackEvent} from 'actions/telemetry_actions';
import Constants, {ModalIdentifiers} from 'utils/constants';
import QuickSwitchModal from 'components/quick_switch_modal';
import * as Utils from 'utils/utils';
import {isDesktopApp} from 'utils/user_agent';

import OverlayTrigger from 'components/overlay_trigger';

import {shortcuts} from 'components/shortcuts/shortcuts';
import ShortcutSequence from 'components/shortcuts/shortcut_sequence';

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

        trackEvent('ui', 'ui_sidebar_open_channel_switcher_v2');

        this.props.actions.openModal({
            modalId: ModalIdentifiers.QUICK_SWITCH,
            dialogType: QuickSwitchModal,
        });
    }

    goBack = () => {
        trackEvent('ui', 'ui_history_back');
        this.props.actions.goBack();
    }

    goForward = () => {
        trackEvent('ui', 'ui_history_forward');
        this.props.actions.goForward();
    }

    render() {
        let channelSwitchTextShortcutDefault = 'Ctrl+K';
        if (Utils.isMac()) {
            channelSwitchTextShortcutDefault = '⌘K';
        }

        let historyArrows;
        const tooltipLeft = (
            <Tooltip
                id='upload-tooltip'
            >
                <ShortcutSequence
                    shortcut={shortcuts.browserChannelPrev}
                    hoistDescription={true}
                />
            </Tooltip>
        );

        const tooltipRight = (
            <Tooltip
                id='upload-tooltip'
            >
                <ShortcutSequence
                    shortcut={shortcuts.browserChannelNext}
                    hoistDescription={true}
                />
            </Tooltip>
        );

        if (isDesktopApp()) {
            historyArrows = (
                <React.Fragment>
                    <OverlayTrigger
                        trigger={['hover']}
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='top'
                        overlay={tooltipLeft}
                    >
                        <button
                            className={classNames('SidebarChannelNavigator_backButton', {disabled: !this.props.canGoBack})}
                            disabled={!this.props.canGoBack}
                            onClick={this.goBack}
                            aria-label={Utils.localizeMessage('sidebar_left.channel_navigator.goBackLabel', 'Back')}
                        >
                            <i className='icon icon-arrow-left'/>
                        </button>
                    </OverlayTrigger>

                    <OverlayTrigger
                        trigger={['hover']}
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='top'
                        overlay={tooltipRight}
                    >
                        <button
                            className={classNames('SidebarChannelNavigator_forwardButton', {disabled: !this.props.canGoForward})}
                            disabled={!this.props.canGoForward}
                            onClick={this.goForward}
                            aria-label={Utils.localizeMessage('sidebar_left.channel_navigator.goForwardLabel', 'Forward')}
                        >
                            <i className='icon icon-arrow-right'/>
                        </button>
                    </OverlayTrigger>
                </React.Fragment>
            );
        }

        return (
            <div className={'SidebarChannelNavigator'}>
                <button
                    className={'SidebarChannelNavigator_jumpToButton'}
                    onClick={this.openQuickSwitcher}
                    aria-label={Utils.localizeMessage('sidebar_left.channel_navigator.channelSwitcherLabel', 'Channel Switcher')}
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
