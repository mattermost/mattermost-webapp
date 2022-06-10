// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {ActionCreatorsMapObject, bindActionCreators, Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';
import {isIntegrationsUsageAtLimit} from 'mattermost-redux/selectors/entities/usage';

import {GlobalState} from 'types/store';

import {disableApp, enableApp, installApp} from 'actions/marketplace';
import {closeModal} from 'actions/views/modals';
import {trackEvent} from 'actions/telemetry_actions.jsx';
import {getInstalling, getError, getChangingStatus} from 'selectors/views/marketplace';
import {ModalIdentifiers} from 'utils/constants';

import MarketplaceItemApp, {MarketplaceItemAppProps} from './marketplace_item_app';

type Props = {
    id: string;
}

function mapStateToProps(state: GlobalState, props: Props) {
    const installing = getInstalling(state, props.id);
    const changingStatus = getChangingStatus(state, props.id);
    const error = getError(state, props.id);
    const integrationsUsageAtLimit = isIntegrationsUsageAtLimit(state);

    return {
        installing,
        changingStatus,
        error,
        trackEvent,
        integrationsUsageAtLimit,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject, MarketplaceItemAppProps['actions']>({
            installApp,
            enableApp,
            disableApp,
            closeMarketplaceModal: () => closeModal(ModalIdentifiers.PLUGIN_MARKETPLACE),
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketplaceItemApp);
