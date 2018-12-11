// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {ChannelHeaderDropdownItems} from 'components/channel_header_dropdown';
import Menu from 'components/widgets/menu/menu.jsx';

export default class ChannelHeaderDropdown extends React.PureComponent {
    render() {
        return (
            <Menu>
                <ChannelHeaderDropdownItems isMobile={false}/>
            </Menu>
        );
    }
}
