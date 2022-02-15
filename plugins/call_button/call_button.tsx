// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties, useState, useEffect, useRef} from 'react';
import {injectIntl, IntlShape} from 'react-intl';
import classNames from 'classnames';

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

    const prevSidebarOpen = ((val: boolean) => {
        const ref = useRef<boolean>();
        useEffect(() => {
            ref.current = val;
        });
        return ref.current;
    })(props.sidebarOpen);

    useEffect(() => {
        if (prevSidebarOpen && !props.sidebarOpen) {
            setClickEnabled(false);
            setTimeout(() => {
                setClickEnabled(true);
            }, Constants.CHANNEL_HEADER_BUTTON_DISABLE_TIMEOUT);
        }
    }, [props.sidebarOpen]);

    const style = {
        container: {
            marginTop: '16px',
            height: '32px',
        } as CSSProperties,
    };

    if (props.pluginCallComponents.length === 1) {
        const item = props.pluginCallComponents[0];

        return (
            <div
                style={style.container}
                className='flex-child'
                onClick={() => {
                    if (item.action && clickEnabled) {
                        item.action(props.currentChannel, props.channelMember);
                    }
                }}
                onTouchEnd={() => {
                    if (item.action && clickEnabled) {
                        item.action(props.currentChannel, props.channelMember);
                    }
                }}
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
                    if (item.action) {
                        item.action(props.currentChannel, props.channelMember);
                    }
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
            <MenuWrapper
                onToggle={(toggle: boolean) => {
                    setActive(toggle);
                }}
            >
                <button
                    type='button'
                    className={classNames('style--none call-button', 'dropdown', {active})}
                >
                    <span
                        className='icon icon-phone-outline'
                        aria-label={formatMessage({id: 'generic_icons.call', defaultMessage: 'Call Icon'}).toLowerCase()}
                    />
                    <span className='call-button-label'>{'Call'}</span>
                    <span
                        className='icon icon-chevron-down'
                        aria-label={formatMessage({id: 'generic_icons.dropdown', defaultMessage: 'Dropdown Icon'}).toLowerCase()}
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
