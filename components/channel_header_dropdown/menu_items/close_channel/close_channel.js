// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {localizeMessage} from 'utils/utils';

import MenuItemAction from 'components/widgets/menu/menu_items/menu_item_action';

export default class CloseChannel extends React.PureComponent {
    static propTypes = {
        isArchived: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            goToLastViewedChannel: PropTypes.func.isRequired,
        }).isRequired,
    }

    handleClose = () => {
        this.props.actions.goToLastViewedChannel();
    }

    render() {
        return (
            <MenuItemAction
                show={this.props.isArchived}
                onClick={this.handleClose}
                text={localizeMessage('center_panel.archived.closeChannel', 'Close Channel')}
            />
        );
    }
}
