// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {trackEvent} from 'actions/telemetry_actions';

import {openModal} from 'actions/views/modals';

import {General} from 'mattermost-redux/constants';

import {leaveChannel} from 'mattermost-redux/actions/channels';

import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';
import {getMyChannelMembership} from 'mattermost-redux/selectors/entities/channels';

import {LeastActiveChannel} from '@mattermost/types/insights';
import {GlobalState} from '@mattermost/types/store';

import Constants, {ModalIdentifiers} from 'utils/constants';
import {copyToClipboard, localizeMessage} from 'utils/utils';
import {getSiteURL} from 'utils/url';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import LeavePrivateChannelModal from 'components/leave_private_channel_modal';

import './channel_actions_menu.scss';

type Props = {
    channel: LeastActiveChannel;
    actionCallback?: () => Promise<void>;
}

const ChannelActionsMenu = ({channel, actionCallback}: Props) => {
    const dispatch = useDispatch();
    const currentTeamUrl = useSelector(getCurrentRelativeTeamUrl);
    const isChannelMember = useSelector((state: GlobalState) => getMyChannelMembership(state, channel.id));
    const isDefault = channel.name === General.DEFAULT_CHANNEL;

    const handleLeave = useCallback(async (e: Event) => {
        e.preventDefault();
        trackEvent('insights', 'leave_channel_action');

        if (channel.type === Constants.PRIVATE_CHANNEL) {
            dispatch(openModal({
                modalId: ModalIdentifiers.LEAVE_PRIVATE_CHANNEL_MODAL,
                dialogType: LeavePrivateChannelModal,
                dialogProps: {
                    channel,
                    callback: actionCallback,
                },
            }));
        } else {
            await dispatch(leaveChannel(channel.id));
            actionCallback?.();
        }
    }, [channel]);

    const copyLink = useCallback(() => {
        trackEvent('insights', 'copy_channel_link_action');
        copyToClipboard(`${getSiteURL()}${currentTeamUrl}/channels/${channel.name}`);
    }, [currentTeamUrl, channel]);

    return (
        <div className='channel-action'>
            <MenuWrapper
                isDisabled={false}
                stopPropagationOnToggle={true}
                id={`customWrapper-${channel.id}`}
            >
                <button className='icon action-wrapper'>
                    <i className='icon icon-dots-vertical'/>
                </button>
                <Menu
                    openLeft={true}
                    openUp={false}
                    className={'group-actions-menu'}
                    ariaLabel={localizeMessage('insights.leastActiveChannels.menuAriaLabel', 'Manage channel menu')}
                >
                    <Menu.Group>
                        <Menu.ItemAction
                            onClick={handleLeave}
                            icon={<i className='icon-logout-variant'/>}
                            text={localizeMessage('insights.leastActiveChannels.leaveChannel', 'Leave channel')}
                            disabled={false}
                            isDangerous={true}
                            show={Boolean(isChannelMember) && !isDefault}
                        />
                    </Menu.Group>
                    <Menu.Group>
                        <Menu.ItemAction
                            onClick={copyLink}
                            icon={<i className='icon-link-variant'/>}
                            text={localizeMessage('insights.leastActiveChannels.copyLink', 'Copy link')}
                            disabled={false}
                        />
                    </Menu.Group>
                </Menu>
            </MenuWrapper>
        </div>
    );
};

export default memo(ChannelActionsMenu);
