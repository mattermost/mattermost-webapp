// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';
import {IntlShape} from 'react-intl';

import {Audit} from '@mattermost/types/audits';

import {getUser} from 'mattermost-redux/selectors/entities/users';
import {getChannelByName, getDirectTeammate} from 'mattermost-redux/selectors/entities/channels';

import {GlobalState} from 'types/store';

import AuditRow from '../audit_row';
import holders from '../holders';

type Props = {
    audit: Audit;
    actionURL: string;
    intl: IntlShape;
}

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const {
        audit,
        intl,
        actionURL,
    } = ownProps;

    let desc = '';
    const channelInfo = audit.extra_info.split(' ');
    const channelNameField = channelInfo[0].split('=');

    let channelURL = '';
    let channelObj;
    let channelName = '';
    if (channelNameField.indexOf('name') >= 0) {
        channelURL = channelNameField[channelNameField.indexOf('name') + 1];
        channelObj = getChannelByName(state, channelURL);
        if (channelObj) {
            channelName = channelObj.display_name;
        } else {
            channelName = channelURL;
        }
    }

    switch (actionURL) {
    case '/channels/create':
        desc = intl.formatMessage(holders.channelCreated, {channelName});
        break;
    case '/channels/create_direct':
        if (channelObj) {
            desc = intl.formatMessage(holders.establishedDM, {username: getDirectTeammate(state, channelObj.id)?.username});
        }
        break;
    case '/channels/update':
        desc = intl.formatMessage(holders.nameUpdated, {channelName});
        break;
    case '/channels/update_desc': // support the old path
    case '/channels/update_header':
        desc = intl.formatMessage(holders.headerUpdated, {channelName});
        break;
    default: {
        let userIdField = [];
        let userId = '';
        let username = '';

        if (channelInfo[1]) {
            userIdField = channelInfo[1].split('=');

            if (userIdField.indexOf('user_id') >= 0) {
                userId = userIdField[userIdField.indexOf('user_id') + 1];
                const profile = getUser(state, userId);
                if (profile) {
                    username = profile.username;
                }
            }
        }

        if ((/\/channels\/[A-Za-z0-9]+\/delete/).test(actionURL)) {
            desc = intl.formatMessage(holders.channelDeleted, {url: channelURL});
        } else if ((/\/channels\/[A-Za-z0-9]+\/add/).test(actionURL)) {
            desc = intl.formatMessage(holders.userAdded, {username, channelName});
        } else if ((/\/channels\/[A-Za-z0-9]+\/remove/).test(actionURL)) {
            desc = intl.formatMessage(holders.userRemoved, {username, channelName});
        }

        break;
    }
    }

    return {
        desc,
    };
}

const connector = connect(mapStateToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(AuditRow);
