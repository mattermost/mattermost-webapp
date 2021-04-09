// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';
import {getListing, getInstalledListing} from 'selectors/views/marketplace';
import {setFirstAdminVisitMarketplaceStatus} from 'mattermost-redux/actions/general';
import {getFirstAdminVisitMarketplaceStatus} from 'mattermost-redux/selectors/entities/general';

import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';
import {getSiteURL} from 'utils/url';

import {closeModal} from 'actions/views/modals';
import {fetchListing, filterListing} from 'actions/marketplace';

import {MarketplaceModal} from './marketplace_modal';

function mapStateToProps(state: GlobalState) {
    return {
        show: isModalOpen(state, ModalIdentifiers.PLUGIN_MARKETPLACE),
        listing: getListing(state),
        installedListing: getInstalledListing(state),
        siteURL: getSiteURL(),
        pluginStatuses: state.entities.admin.pluginStatuses,
        firstAdminVisitMarketplaceStatus: getFirstAdminVisitMarketplaceStatus(state),
    };
}

type Actions = {
    closeModal(): void;
    fetchListing(localOnly?: boolean): Promise<{error?: Error}>;
    filterListing(filter: string): Promise<{error?: Error}>;
    setFirstAdminVisitMarketplaceStatus(): Promise<void>;
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc | GenericAction>, Actions>({
            closeModal: () => closeModal(ModalIdentifiers.PLUGIN_MARKETPLACE),
            fetchListing,
            filterListing,
            setFirstAdminVisitMarketplaceStatus,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceModal);
