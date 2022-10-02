// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect, ConnectedProps} from 'react-redux';

import {IntlShape} from 'react-intl';

import {Audit} from '@mattermost/types/audits';

import {getUser} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

import holders from '../holders';
import {toTitleCase} from 'utils/utils';

import AuditRow from './audit_row';

type Props = {
    audit: Audit;
    desc: string;
    actionURL: string;
    intl: IntlShape;
}

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const {
        audit,
        intl,
        actionURL,
    } = ownProps;
    let desc = ownProps.desc;

    /* If all else fails... */
    if (!desc) {
        /* Currently not called anywhere */
        if (audit.extra_info.indexOf('revoked_all=') >= 0) {
            desc = intl.formatMessage(holders.revokedAll);
        } else {
            let actionDesc = '';
            if (actionURL && actionURL.lastIndexOf('/') !== -1) {
                actionDesc = actionURL.substring(actionURL.lastIndexOf('/') + 1).replace('_', ' ');
                actionDesc = toTitleCase(actionDesc);
            }

            let extraInfoDesc = '';
            if (audit.extra_info) {
                extraInfoDesc = audit.extra_info;

                if (extraInfoDesc.indexOf('=') !== -1) {
                    extraInfoDesc = extraInfoDesc.substring(extraInfoDesc.indexOf('=') + 1);
                }
            }
            desc = actionDesc + ' ' + extraInfoDesc;
        }
    }

    const user = getUser(state, ownProps.audit.user_id);
    return {
        desc,
        userId: user.email ?? ownProps.audit.user_id,
    };
}

const connector = connect(mapStateToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(AuditRow);
