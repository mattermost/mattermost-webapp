// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl, IntlShape} from 'react-intl';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import CameraIcon from 'components/widgets/icons/camera_icon';

import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import {PluginComponent} from 'types/store/plugins';

const customStyles: React.CSSProperties = {
    left: 'inherit',
    right: 0,
    bottom: '100%',
    top: 'auto',
};

type Props = {
    currentChannel: Channel;
    channelMember?: ChannelMembership;
    intl: IntlShape;
    locale: string;
    pluginCallMethods: PluginComponent[];
}

function CallButton(props: Props) {
    const {formatMessage} = props.intl;

    let bodyAction;

    if (props.pluginCallMethods.length === 0) {
        bodyAction = null;
    } else if (props.pluginCallMethods.length === 1) {
        const item = props.pluginCallMethods[0];
        bodyAction = (
            <button
                type='button'
                className='style--none post-action icon icon--attachment'
                onClick={() => {
                    if (item.action) {
                        item.action(props.currentChannel, props.channelMember);
                    }
                }}
                onTouchEnd={() => {
                    if (item.action) {
                        item.action(props.currentChannel, props.channelMember);
                    }
                }}
            >
                {item.icon}
            </button>
        );
    } else {
        const pluginCallMethods = props.pluginCallMethods.map((item) => {
            return (
                <li
                    key={item.id}
                    onClick={(e) => {
                        e.preventDefault();
                        if (item.action) {
                            item.action(props.currentChannel, props.channelMember);
                        }
                    }}
                >
                    <a href='#'>
                        <span className='call-plugin-icon'>
                            {item.icon}
                        </span>
                        {item.dropdownText}
                    </a>
                </li>
            );
        });
        bodyAction = (
            <MenuWrapper>
                <button
                    type='button'
                    className='style--none post-action'
                >
                    <div
                        className='icon icon--attachment'
                    >
                        <CameraIcon className='d-flex'/>
                    </div>
                </button>
                <Menu
                    id='callOptions'
                    openLeft={true}
                    openUp={true}
                    ariaLabel={formatMessage({id: 'call_button.menuAriaLabel', defaultMessage: 'Call type selector'})}
                    customStyles={customStyles}
                >
                    {pluginCallMethods}
                </Menu>
            </MenuWrapper>
        );
    }

    return bodyAction;
}

CallButton.defaultProps = {
    pluginCallMethods: [],
};

const wrappedComponent = injectIntl(CallButton);
wrappedComponent.displayName = 'injectIntl(CallButton)';
export default wrappedComponent;
