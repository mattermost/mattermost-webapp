// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useSelector} from 'react-redux';

import {useProducts} from 'utils/products';

import {GlobalState} from 'types/store';
import {suitePluginIds} from 'utils/constants';

export const useGetPluginsActivationState = () => {
    const pluginsList = useSelector((state: GlobalState) => state.plugins.plugins);
    const pluginProducts = useProducts();

    let boardsProductEnabled = false;
    let playbooksProductEnabled = false;
    if (pluginProducts) {
        boardsProductEnabled = pluginProducts.some((product) => (product.pluginId === suitePluginIds.focalboard) || (product.pluginId === suitePluginIds.boards));
        playbooksProductEnabled = pluginProducts.some((product) => product.pluginId === suitePluginIds.playbooks);
    }
    const boardsPlugin = pluginsList.focalboard;
    const playbooksPlugin = pluginsList.playbooks;

    return {boardsPlugin: Boolean(boardsPlugin), playbooksPlugin: Boolean(playbooksPlugin), boardsProductEnabled, playbooksProductEnabled};
};
