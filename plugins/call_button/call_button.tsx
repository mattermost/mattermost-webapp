// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect, useRef} from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';

import PhoneOutlineIcon from '@mattermost/compass-icons/components/phone-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';

import {useDispatch} from 'react-redux';

import {createDirectChannel} from 'mattermost-redux/actions/channels';
import {ActionResult} from 'mattermost-redux/types/actions';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import {Constants} from 'utils/constants';

import {Channel, ChannelMembership} from '@mattermost/types/channels';
import {PluginComponent} from 'types/store/plugins';

import './call_button.scss';

type Props = {
    currentChannel: Channel;
    channelMember?: ChannelMembership;
    pluginCallComponents: PluginComponent[];
    sidebarOpen: boolean;
    currentUserId: string;
    customButton?: JSX.Element;
    userId?: string;
    channelToStartCall?: Channel | null;
    startCallInDM?: boolean;
}

export default function CallButton({pluginCallComponents, currentChannel, channelMember, sidebarOpen, customButton, channelToStartCall, currentUserId, userId, startCallInDM = false}: Props) {
    const [active, setActive] = useState(false);
    const [clickEnabled, setClickEnabled] = useState(true);
    const prevSidebarOpen = useRef(sidebarOpen);
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    useEffect(() => {
        if (prevSidebarOpen.current && !sidebarOpen) {
            setClickEnabled(false);
            setTimeout(() => {
                setClickEnabled(true);
            }, Constants.CHANNEL_HEADER_BUTTON_DISABLE_TIMEOUT);
        }
        prevSidebarOpen.current = sidebarOpen;
    }, [sidebarOpen]);

    if (pluginCallComponents.length === 0) {
        return null;
    }

    const getDmChannel = async () => {
        let dmChannel = channelToStartCall;

        if (startCallInDM && !channelToStartCall && userId) {
            const {data} = await dispatch(createDirectChannel(currentUserId, userId)) as ActionResult;
            if (data) {
                dmChannel = data;
            }
        }
        return dmChannel;
    };

    if (pluginCallComponents.length === 1) {
        const item = pluginCallComponents[0];
        const clickHandler = async () => {
            const channelForCall = await getDmChannel() || currentChannel;
            item.action?.(channelForCall, channelMember);
        };

        return (
            <div
                className='callButtonContainer flex-child'
                onClick={clickEnabled ? clickHandler : undefined}
                onTouchEnd={clickEnabled ? clickHandler : undefined}
            >
                {customButton || item.button}
            </div>
        );
    }

    const items = pluginCallComponents.map((item) => {
        return (
            <li
                className='MenuItem'
                key={item.id}
                onClick={async (e) => {
                    e.preventDefault();
                    const channelForCall = await getDmChannel() || currentChannel;
                    item.action?.(channelForCall, channelMember);
                }}
            >
                {item.dropdownButton}
            </li>
        );
    });

    return (
        <div
            className='callButtonContainer flex-child'
        >
            <MenuWrapper onToggle={(toggle: boolean) => setActive(toggle)}>
                <button className={classNames('style--none call-button dropdown', {active})}>
                    <PhoneOutlineIcon
                        color='inherit'
                        aria-label={formatMessage({id: 'generic_icons.call', defaultMessage: 'Call icon'}).toLowerCase()}
                    />
                    <span className='call-button-label'>{'Call'}</span>
                    <ChevronDownIcon
                        color='inherit'
                        aria-label={formatMessage({id: 'generic_icons.dropdown', defaultMessage: 'Dropdown icon'}).toLowerCase()}
                    />
                </button>
                <Menu
                    id='callOptions'
                    ariaLabel={formatMessage({id: 'call_button.menuAriaLabel', defaultMessage: 'Call type selector'})}
                    customStyles={{
                        top: 'auto',
                        left: 'auto',
                        right: 0,
                    }}
                >
                    {items}
                </Menu>
            </MenuWrapper>
        </div>
    );
}
