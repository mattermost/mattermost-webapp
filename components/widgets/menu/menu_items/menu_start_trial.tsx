// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';

import {getLicenseConfig} from 'mattermost-redux/actions/general';
import {requestTrialLicense} from 'actions/admin_actions';
import {GlobalState} from 'mattermost-redux/types/store';

import './menu_item.scss';

type Props = {
    id: string;
    show: boolean;
}

const MenuStartTrial = (props: Props): JSX.Element | null => {
    const {formatMessage} = useIntl();
    const history = useHistory();

    const dispatch = useDispatch();
    const stats = useSelector((state: GlobalState) => state.entities.admin.analytics);

    const requestLicense = async () => {
        let users = 0;
        if (stats && (typeof stats.TOTAL_USERS === 'number')) {
            users = stats.TOTAL_USERS;
        }
        const requestedUsers = Math.max(users, 30);
        await dispatch(requestTrialLicense(requestedUsers, true, true, 'license'));
        await dispatch(getLicenseConfig());
        history.push('/admin_console/about/license');
    };

    if (!props.show) {
        return null;
    }

    return (
        <li
            className={'MenuStartTrial'}
            role='menuitem'
            id={props.id}
        >
            <span>{formatMessage({id: 'navbar_dropdown.tryTrialNow', defaultMessage: 'Try Enterprise for free now!'})}</span>
            <button onClick={requestLicense}>{formatMessage({id: 'navbar_dropdown.startTrial', defaultMessage: 'Start Trial'})}</button>
        </li>
    );
};

export default MenuStartTrial;
