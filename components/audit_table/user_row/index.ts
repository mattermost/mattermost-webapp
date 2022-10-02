// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {IntlShape} from 'react-intl';

import {Audit} from '@mattermost/types/audits';

import {getUser, getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {isSystemAdmin} from 'mattermost-redux/utils/user_utils';

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
        actionURL,
        intl,
    } = ownProps;

    const userInfo = audit.extra_info.split(' ');

    let desc = '';

    switch (actionURL) {
    case '/users/login':
        if (userInfo[0] === 'attempt') {
            desc = intl.formatMessage(holders.attemptedLogin);
        } else if (userInfo[0] === 'success') {
            desc = intl.formatMessage(holders.successfullLogin);
        } else if (userInfo[0] === 'authenticated') {
            desc = intl.formatMessage(holders.authenticated);
        } else if (userInfo[0]) {
            desc = intl.formatMessage(holders.failedLogin);
        }

        break;
    case '/users/revoke_session':
        desc = intl.formatMessage(holders.sessionRevoked, {
            sessionId: userInfo[0].split('=')[1],
        });
        break;
    case '/users/newimage':
        desc = intl.formatMessage(holders.updatePicture);
        break;
    case '/users/update':
        desc = intl.formatMessage(holders.updateGeneral);
        break;
    case '/users/newpassword':
        if (userInfo[0] === 'attempted') {
            desc = intl.formatMessage(holders.attemptedPassword);
        } else if (userInfo[0] === 'completed') {
            desc = intl.formatMessage(holders.successfullPassword);
        } else if (
            userInfo[0] ===
                'failed - tried to update user password who was logged in through oauth'
        ) {
            desc = intl.formatMessage(holders.failedPassword);
        }

        break;
    case '/users/update_roles': {
        const userRoles = userInfo[0].split('=')[1];

        desc = intl.formatMessage(holders.updatedRol);
        if (userRoles.trim()) {
            desc += userRoles;
        } else {
            desc += intl.formatMessage(holders.member);
        }

        break;
    }
    case '/users/update_active': {
        const updateType = userInfo[0].split('=')[0];
        const updateField = userInfo[0].split('=')[1];

        /* Either describes account activation/deactivation or a revoked session as part of an account deactivation */
        if (updateType === 'active') {
            if (updateField === 'true') {
                desc = intl.formatMessage(holders.accountActive);
            } else if (updateField === 'false') {
                desc = intl.formatMessage(holders.accountInactive);
            }

            const actingUserInfo = userInfo[1].split('=');
            if (actingUserInfo[0] === 'session_user') {
                const actingUser = getUser(state, actingUserInfo[1]);
                const user = getCurrentUser(state);
                if (user && actingUser && isSystemAdmin(user.roles)) {
                    desc += intl.formatMessage(holders.by, {
                        username: actingUser.username,
                    });
                } else if (user && actingUser) {
                    desc += intl.formatMessage(holders.byAdmin);
                }
            }
        } else if (updateType === 'session_id') {
            desc = intl.formatMessage(holders.sessionRevoked, {
                sessionId: updateField,
            });
        }

        break;
    }
    case '/users/send_password_reset':
        desc = intl.formatMessage(holders.sentEmail, {
            email: userInfo[0].split('=')[1],
        });
        break;
    case '/users/reset_password':
        if (userInfo[0] === 'attempt') {
            desc = intl.formatMessage(holders.attemptedReset);
        } else if (userInfo[0] === 'success') {
            desc = intl.formatMessage(holders.successfullReset);
        }

        break;
    case '/users/update_notify':
        desc = intl.formatMessage(holders.updateGlobalNotifications);
        break;
    default:
        break;
    }

    return {
        desc,
    };
}

export default connect(mapStateToProps)(AuditRow);
