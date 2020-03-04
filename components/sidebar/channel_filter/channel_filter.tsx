// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {

};

type State = {

};

export default class ChannelFilter extends React.PureComponent<Props, State> {
    render() {
        return (
            <div className='SidebarFilters'>
                <a
                    href='#'
                    className='SidebarFilters_filterButton'
                >
                    <i className='icon icon-filter-variant'/>
                </a>
            </div>
        );
    }
}
