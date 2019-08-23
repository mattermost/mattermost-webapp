// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {
    getPlugins,
    installPluginFromUrl,
} from 'mattermost-redux/actions/admin';

import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';

import {closeModal} from 'actions/views/modals';

import MarketplaceModal from './marketplace_modal.jsx';

// WIP - This will be repleace with server call to get marketplace plugins
const plugin1 = {
    download_url: 'https://github.com/mattermost/mattermost-plugin-autolink/releases/download/v1.1.0/mattermost-autolink-1.1.0.tar.gz',
    icon_url: 'https://integrations.mattermost.com/wp-content/uploads/2019/01/icon@2x.jpg',
    manifest: {
        id: 'mattermost-autolink',
        name: 'Autolink',
        description: 'Automatically rewrite text matching a regular expression into a Markdown link.',
        version: '1.1.0',
    },
};

const plugin2 = {
    download_url: 'https://github.com/matterpsdfoll/matterpoll/releases/download/v1.1.0/com.github.matterpoll.matterpoll-1.1.0.tar.gz',
    icon_url: 'https://integrations.mattermost.com/wp-content/uploads/2019/01/icon@2x.jpg',
    manifest: {
        id: 'com.github.matterpoll.matterpoll',
        name: 'Matterpoll',
        description: 'This is a plugin to integrate polls in Mattermost.',
        version: '1.0.1',
    },
};

const plugins = [plugin1, plugin2];

function mapStateToProps(state) {
    return {
        show: isModalOpen(state, ModalIdentifiers.INTEGRATIONS_MARKETPLACE),
        installedPlugins: state.entities.admin.plugins,
        marketplacePlugins: plugins,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeModal: () => closeModal(ModalIdentifiers.INTEGRATIONS_MARKETPLACE),
            getPlugins,
            installPluginFromUrl,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceModal);
