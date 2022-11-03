// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';
import {MenuItem, MenuList, Divider} from '@mui/material';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {GlobalState} from 'types/store';

import {MenuComponent} from './menu';

function mapStateToProps(state: GlobalState) {
    return {
        theme: getTheme(state),
    };
}

const connector = connect(mapStateToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

const Menu = connector(MenuComponent);

const MenuDivider = Divider;

export {
    Menu,
    MenuItem,
    MenuList,
    MenuDivider,
};
