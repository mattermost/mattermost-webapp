// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, IntlShape, injectIntl} from 'react-intl';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';

type Props = {
    intl: IntlShape;
    showMoreChannelsModal: () => void;
    showNewChannelModal: () => void;
};

type State = {

};

class AddChannelDropdown extends React.PureComponent<Props, State> {
    render() {
        const {formatMessage} = this.props.intl;

        return (
            <MenuWrapper className='AddChannelDropdown'>
                <button className='AddChannelDropdown_dropdownButton'>
                    <i className='icon-plus'/>
                </button>
                <Menu
                    id='AddChannelDropdown'
                    ariaLabel={formatMessage({id: 'sidebar_left.add_channel_dropdown.dropdownAriaLabel', defaultMessage: 'Add Channel Dropdown'})}
                >
                    <Menu.Group>
                        <Menu.ItemAction
                            id='showMoreChannels'
                            onClick={this.props.showMoreChannelsModal}
                            icon={<i className='icon-globe'/>}
                            text={formatMessage({id: 'sidebar_left.add_channel_dropdown.browseChannels', defaultMessage: 'Browse Channels'})}
                        />
                        <Menu.ItemAction
                            id='showNewChannel'
                            onClick={this.props.showNewChannelModal}
                            icon={<i className='icon-plus'/>}
                            text={formatMessage({id: 'sidebar_left.add_channel_dropdown.createNewChannel', defaultMessage: 'Create New Channel'})}
                        />
                    </Menu.Group>
                </Menu>
            </MenuWrapper>
        );
    }
}

export default injectIntl(AddChannelDropdown);
