// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties, useState, useEffect, useRef} from 'react';
import {injectIntl, IntlShape} from 'react-intl';
import classNames from 'classnames';

import PhoneOutlineIcon from '@mattermost/compass-icons/components/phone-outline';

import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import {Constants} from 'utils/constants';

import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import {PluginComponent} from 'types/store/plugins';

import './call_button.scss';

type Props = {
    currentChannel: Channel;
    channelMember?: ChannelMembership;
    intl: IntlShape;
    locale: string;
    pluginCallComponents: PluginComponent[];
    sidebarOpen: boolean;
}

function CallButton(props: Props) {
    if (props.pluginCallComponents.length === 0) {
        return null;
    }

    const {formatMessage} = props.intl;
    const [active, setActive] = useState(false);
    const [clickEnabled, setClickEnabled] = useState(true);
    const prevSidebarOpen = useRef(props.sidebarOpen);

    useEffect(() => {
        if (prevSidebarOpen.current && !props.sidebarOpen) {
            setClickEnabled(false);
            setTimeout(() => {
                setClickEnabled(true);
            }, Constants.CHANNEL_HEADER_BUTTON_DISABLE_TIMEOUT);
        }
        prevSidebarOpen.current = props.sidebarOpen;
    }, [props.sidebarOpen]);

    const style = {
        container: {
            marginTop: 16,
            height: 32,
        } as CSSProperties,
    };

    if (props.pluginCallComponents.length === 1) {
        const item = props.pluginCallComponents[0];
        const clickHandler = () => item.action?.(props.currentChannel, props.channelMember);

        return (
            <div
                style={style.container}
                className='flex-child'
                onClick={clickEnabled ? clickHandler : undefined}
                onTouchEnd={clickEnabled ? clickHandler : undefined}
            >
                {item.button}
            </div>
        );
    }

    const pluginCallComponents = props.pluginCallComponents.map((item) => {
        return (
            <li
                className='MenuItem'
                key={item.id}
                onClick={(e) => {
                    e.preventDefault();
                    item.action?.(props.currentChannel, props.channelMember);
                }}
            >

                {item.dropdownButton}
            </li>
        );
    });

    return (
        <div
            style={style.container}
            className='flex-child'
        >
            <MenuWrapper onToggle={(toggle: boolean) => setActive(toggle)}>
                <button
                    className={classNames('style--none call-button', 'dropdown', {active})}
                >
                    <span>
                        <PhoneOutlineIcon
                            color=''
                            aria-label={formatMessage({id: 'generic_icons.call', defaultMessage: 'Call Icon'}).toLowerCase()}
                        />
                    </span>
                    <span className='call-button-label'>{'Call'}</span>
                    <span>
                        <ChevronDownIcon
                            color=''
                            aria-label={formatMessage({id: 'generic_icons.dropdown', defaultMessage: 'Dropdown Icon'}).toLowerCase()}
                        />
                    </span>
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
                    {pluginCallComponents}
                </Menu>
            </MenuWrapper>
        </div>
    );
}

CallButton.defaultProps = {
    pluginCallComponents: [],
};

const wrappedComponent = injectIntl(CallButton);
wrappedComponent.displayName = 'injectIntl(CallButton)';
export default wrappedComponent;
