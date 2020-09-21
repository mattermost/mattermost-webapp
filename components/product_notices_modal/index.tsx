// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {ProductNotices} from 'mattermost-redux/types/product_notices';
import {WebsocketStatus} from 'mattermost-redux/types/websocket';
import {getInProductNotices, updateNoticesAsViewed} from 'mattermost-redux/actions/teams';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {ClientConfig} from 'mattermost-redux/types/config';

import {getSocketStatus} from 'selectors/views/websocket';
import {GlobalState} from 'types/store';

import ProductNoticesModal from './product_notices_modal';

type Actions = {
    getInProductNotices: (teamId: string, client: string, clientVersion: string) => Promise<{
        data: ProductNotices;
    }>;
    updateNoticesAsViewed: (noticeIds: string[]) => Promise<Record<string, unknown>>;
}

function mapStateToProps(state: GlobalState) {
    const config: Partial<ClientConfig> = getConfig(state);
    const version: string = config.Version || ''; //this should always exist but TS throws error
    const socketStatus: WebsocketStatus = getSocketStatus(state);

    return {
        currentTeamId: getCurrentTeamId(state),
        version,
        socketStatus,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getInProductNotices,
            updateNoticesAsViewed,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductNoticesModal);
