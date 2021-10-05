// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ProductComponent} from 'types/store/plugins';

type TestProductComponent = Omit<ProductComponent, 'switcherIcon'> & {
    switcherIcon: string;
}

export function makeProduct(name: string): TestProductComponent {
    return {
        id: name,
        pluginId: '',
        switcherIcon: `product-${name.toLowerCase()}`,
        switcherText: name,
        baseURL: '',
        switcherLinkURL: '',
        mainComponent: null,
        headerCentreComponent: null,
        headerRightComponent: null,
    };
}
