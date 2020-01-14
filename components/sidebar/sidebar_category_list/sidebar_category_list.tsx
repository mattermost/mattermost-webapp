// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type Props = {
    categories: any[],
};

type State = {

};

export default class SidebarCategoryList extends React.PureComponent<Props, State> {
    render() {
        return (
            <div>
                {'Sidebar Category List'}
            </div>
        );
    }
}
