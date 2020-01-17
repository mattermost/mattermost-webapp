// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import SidebarCategory from '../sidebar_category';

type Props = {
    categories: any[],
};

type State = {

};

export default class SidebarCategoryList extends React.PureComponent<Props, State> {
    renderCategory = (category: any) => {
        return (
            <SidebarCategory category={category}/>
        );
    }

    render() {
        const {categories} = this.props;
        const renderedCategories = categories.map(this.renderCategory);

        return (
            <div>
                {'Sidebar Category List'}
                {renderedCategories}
            </div>
        );
    }
}
