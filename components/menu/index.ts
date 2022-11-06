// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {GlobalState} from 'types/store';

import {MenuComponent} from './menu';
import {SubMenu} from './sub_menu';
import {MenuItem} from './menu_item';
import {MenuDivider} from './menu_divider';

function mapStateToProps(state: GlobalState) {
    return {
        theme: getTheme(state),
    };
}

const connector = connect(mapStateToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

const Menu = connector(MenuComponent);

export {
    Menu,
    SubMenu,
    MenuItem,
    MenuDivider,
};
