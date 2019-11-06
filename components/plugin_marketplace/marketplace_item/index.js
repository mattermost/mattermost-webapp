// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {installPlugin} from 'actions/marketplace';
import {closeModal} from 'actions/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {getInstalling, getError} from 'selectors/views/marketplace';

import MarketplaceItem from './marketplace_item';

function mapStateToProps(state, props) {
    const installing = getInstalling(state, props.id);
    const error = getError(state, props.id);

    return {
        installing,
        error,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            installPlugin,
            closeMarketplaceModal: () => closeModal(ModalIdentifiers.PLUGIN_MARKETPLACE),
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceItem);
