// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';
import {Constants} from 'utils/constants';

const MenuItemContainer = styled.div`
    padding: 8px 16px;
    flex: 1;
    display: flex;
`;

const Icon = styled.div`
    color: rgba(var(--center-channel-color-rgb), 0.56);
`;

const MenuItemText = styled.div`
    padding-left: 8px;
    flex: 1;
`;

interface MenuItemProps {
    className?: string;
    icon: JSX.Element;
    text: string;
    onClick: () => void;
}

const menuItem = ({icon, text, className, onClick}: MenuItemProps) => {
    return (
        <div className={className}>
            <MenuItemContainer onClick={onClick}>
                <Icon>{icon}</Icon>
                <MenuItemText>
                    {text}
                </MenuItemText>
            </MenuItemContainer>
        </div>
    );
};

const MenuItem = styled(menuItem)`
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;
    width: 100%;
    height: 40px;

    &:hover {
       background: rgba(var(--center-channel-color-rgb), 0.08);
    }
`;

interface MenuProps {
    channel: Channel;
    isArchived: boolean;

    className?: string;

    actions: {
        openNotificationSettings: () => void;
    };
}

const Menu = ({channel, isArchived, className, actions}: MenuProps) => {
    const {formatMessage} = useIntl();

    const showNotificationPreferences = channel.type !== Constants.DM_CHANNEL && !isArchived;

    return (
        <div className={className}>
            {showNotificationPreferences && (
                <MenuItem
                    icon={<i className='icon icon-bell-outline'/>}
                    text={formatMessage({id: 'channel_info_rhs.menu.notification_preferences', defaultMessage: 'Notification Preferences'})}
                    onClick={actions.openNotificationSettings}
                />
            )}
        </div>
    );
};

const StyledMenu = styled(Menu)`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 0;

    font-size: 14px;
    line-height: 20px;
    color: rgb(var(--center-channel-color-rgb));
`;

export default StyledMenu;
