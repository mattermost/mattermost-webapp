// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {getChannelIntroPluginComponents} from 'selectors/plugins';
import {getDisplayNameByUser} from 'utils/utils';
import {getCurrentLocale} from 'selectors/i18n';
import {GlobalState} from 'types/store';

import StandardIntroMessage from './standard';

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state) || {};
    const creator = getUser(state, channel.creator_id);
    const boardComponent = getChannelIntroPluginComponents(state).find((c) => c.pluginId === 'focalboard');

    return {
        channel,
        locale: getCurrentLocale(state),
        creatorName: getDisplayNameByUser(state, creator),
        boardComponent,
    };
}

export default connect(mapStateToProps)(StandardIntroMessage);
