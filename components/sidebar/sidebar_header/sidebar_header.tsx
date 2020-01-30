// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import SidebarHeaderDropdown from 'components/legacy_sidebar/header/dropdown';

type Props = {

};

type State = {

};

export default class SidebarHeader extends React.PureComponent<Props, State> {
    render() {
        // TODO: temp use of dropdown

        return (
            <div className='SidebarHeader'>
                {'Sidebar Header'}
                <SidebarHeaderDropdown/>
            </div>
        );
    }
}
