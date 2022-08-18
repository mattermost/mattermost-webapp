// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {FormattedMessage} from 'react-intl';

import {Link} from 'react-router-dom';

import {trackEvent} from 'actions/telemetry_actions';

import {openModal} from 'actions/views/modals';

import {General, Permissions} from 'mattermost-redux/constants';

import {leaveChannel} from 'mattermost-redux/actions/channels';

import {getCurrentRelativeTeamUrl, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getMyChannelMembership} from 'mattermost-redux/selectors/entities/channels';

import {LeastActiveChannel} from '@mattermost/types/insights';
import {GlobalState} from '@mattermost/types/store';

import Constants, {ModalIdentifiers} from 'utils/constants';
import {copyToClipboard, localizeMessage} from 'utils/utils';
import {getSiteURL} from 'utils/url';

import Avatars from 'components/widgets/users/avatars';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import Timestamp from 'components/timestamp';
import LeavePrivateChannelModal from 'components/leave_private_channel_modal';

import './../../../activity_and_insights.scss';

type Props = {
    channel: LeastActiveChannel;
    actionCallback: () => Promise<void>;
}

const LeastActiveChannelsItem = ({channel, actionCallback}: Props) => {
    const dispatch = useDispatch();

    const currentTeamUrl = useSelector(getCurrentRelativeTeamUrl);
    const currentTeamId = useSelector(getCurrentTeamId);
    const isChannelMember = useSelector((state: GlobalState) => getMyChannelMembership(state, channel.id));
    const isPrivate = channel.type === Constants.PRIVATE_CHANNEL;
    const channelDeletePermission = isPrivate ? Permissions.DELETE_PRIVATE_CHANNEL : Permissions.DELETE_PUBLIC_CHANNEL;
    const isDefault = channel.name === General.DEFAULT_CHANNEL;

    const trackClickEvent = useCallback(() => {
        trackEvent('insights', 'open_channel_from_least_active_channels_widget');
    }, []);

    const handleLeave = useCallback(async (e: Event) => {
        e.preventDefault();

        if (channel.type === Constants.PRIVATE_CHANNEL) {
            dispatch(openModal({
                modalId: ModalIdentifiers.LEAVE_PRIVATE_CHANNEL_MODAL,
                dialogType: LeavePrivateChannelModal,
                dialogProps: {
                    channel,
                },
            }));
        } else {
            await dispatch(leaveChannel(channel.id));
            actionCallback();
        }
    }, [channel]);

    const iconToDisplay = useCallback(() => {
        let iconToDisplay = <i className='icon icon-globe'/>;

        if (channel.type === Constants.PRIVATE_CHANNEL) {
            iconToDisplay = <i className='icon icon-lock-outline'/>;
        }
        return iconToDisplay;
    }, [channel]);

    const copyLink = useCallback(() => {
        copyToClipboard(`${getSiteURL()}${currentTeamUrl}/channels/${channel.name}`);
    }, [currentTeamUrl, channel]);

    return (
        <Link
            className='channel-row'
            onClick={trackClickEvent}
            to={`${currentTeamUrl}/channels/${channel.name}`}
        >
            <div className='channel-info'>
                <div className='channel-display-name'>
                    <span className='icon'>
                        {iconToDisplay()}
                    </span>
                    <span className='display-name'>{channel.display_name}</span>
                </div>
                <span className='last-activity'>
                    <FormattedMessage
                        id='insights.leastActiveChannels.lastActivity'
                        defaultMessage='Last activity: {time}'
                        values={{
                            time: (
                                <Timestamp
                                    value={channel.last_activity_at}
                                />
                            ),
                        }}
                    />
                </span>
            </div>
            <Avatars
                userIds={channel.participants}
                size='xs'
                disableProfileOverlay={true}
            />
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
                        openLeft={false}
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
                            {/* <ChannelPermissionGate
                                channelId={channel.id}
                                teamId={currentTeamId}
                                permissions={[channelDeletePermission]}
                            >
                                <Menu.ItemToggleModalRedux
                                    icon={<i className='icon-archive-outline'/>}
                                    text={localizeMessage('insights.leastActiveChannels.archiveChannel', 'Archive channel')}
                                    disabled={false}
                                    className='MenuItem__dangerous'
                                    modalId={ModalIdentifiers.DELETE_CHANNEL}
                                    dialogType={DeleteChannelModal}
                                    dialogProps={{
                                        channel,
                                    }}
                                    show={!!isChannelMember && !isDefault}
                                />
                            </ChannelPermissionGate> */}
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
        </Link>
    );
};

export default memo(LeastActiveChannelsItem);
