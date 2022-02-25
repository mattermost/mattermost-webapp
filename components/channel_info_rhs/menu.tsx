// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import styled from 'styled-components';

import {Channel} from 'mattermost-redux/types/channels';
import {Constants} from 'utils/constants';

const Icon = styled.div`
    color: rgba(63, 67, 80, 0.56);
`;

interface MenuItemProps {
    className?: string;

    icon: JSX.Element;
    text: string;
}

const menuItem = ({icon, text, className}: MenuItemProps) => {
    return (
        <div className={className}>
            <Icon>{icon}</Icon>
            <div css={{paddingLeft: '8px'}}>
                {text}
            </div>
        </div>
    );
};

const MenuItem = styled(menuItem)`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    height: 40px;

    &:hover {
       background: rgba(63, 67, 80, 0.08);
    }
`;

interface MenuProps {
    channel: Channel;
    className?: string;
}

const Menu = ({channel, className}: MenuProps) => {
    const showChannelSettings = [Constants.OPEN_CHANNEL, Constants.PRIVATE_CHANNEL].includes(channel.type);

    return (
        <div className={className}>
            {showChannelSettings && (
                <MenuItem
                    icon={<i className='icon icon-tune'/>}
                    text='Channel Settings'
                />
            )}
            <MenuItem
                icon={<i className='icon icon-bell-outline'/>}
                text='Notification Preferences'
            />
        </div>
    );
};

const StyledMenu = styled(Menu)`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 4px;

    font-family: Open Sans;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 20px;
    color: #3F4350;
`;

export default StyledMenu;
