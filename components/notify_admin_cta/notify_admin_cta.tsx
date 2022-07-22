// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';
import {useSelector} from 'react-redux';

import {Client4} from 'mattermost-redux/client';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

const Span = styled.span`
font-family: 'Open Sans';
font-size: 12px;
font-style: normal;
font-weight: 600;
line-height: 16px;
`;

const StyledA = styled.a`
border: none;
background: none;
color: var(--denim-button-bg);
text-decoration: none;
display: inline;
`;

enum NotifyStatus {
    NotStarted = 'NOT_STARTED',
    Started = 'STARTED',
    Success = 'SUCCESS',
    Failed = 'FAILED',
    AlreadyComplete = 'COMPLETE'
}

export enum DafaultBtnText {
    NotifyAdmin = 'Notify your admin',
    Notifying = 'Notifying...',
    Notified = 'Notified!',
    AlreadyNotified = 'Already notified!',
    Failed = 'Try again later!',
}

type Props = {
    ctaText?: React.ReactNode;
}

export function useNotifyAdmin<T = HTMLAnchorElement | HTMLButtonElement>(props: Props): [React.ReactNode, (e: React.MouseEvent<T, MouseEvent>) => void] {
    const currentTeam = useSelector(getCurrentTeamId);
    const [notifyStatus, setStatus] = useState(NotifyStatus.NotStarted);
    const {formatMessage} = useIntl();

    const btnText = (status: NotifyStatus): React.ReactNode => {
        switch (status) {
        case NotifyStatus.Started:
            return formatMessage({id: 'notify_admin_to_upgrade_cta.notify-admin.notifying', defaultMessage: DafaultBtnText.Notifying});
        case NotifyStatus.Success:
            return formatMessage({id: 'notify_admin_to_upgrade_cta.notify-admin.notified', defaultMessage: DafaultBtnText.Notified});
        case NotifyStatus.AlreadyComplete:
            return formatMessage({id: 'notify_admin_to_upgrade_cta.notify-admin.already_notified', defaultMessage: DafaultBtnText.AlreadyNotified});
        case NotifyStatus.Failed:
            return formatMessage({id: 'notify_admin_to_upgrade_cta.notify-admin.failed', defaultMessage: DafaultBtnText.Failed});
        default:
            return props.ctaText || formatMessage({id: 'notify_admin_to_upgrade_cta.notify-admin.notify', defaultMessage: DafaultBtnText.NotifyAdmin});
        }
    };

    const notifyFunc = async (e: React.MouseEvent<T, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            setStatus(NotifyStatus.Started);
            const req = {
                current_team_id: currentTeam,
            };
            await Client4.notifyAdminToUpgrade(req);
            setStatus(NotifyStatus.Success);
        } catch (error) {
            if (error && error.status_code === 403) {
                setStatus(NotifyStatus.AlreadyComplete);
            } else {
                setStatus(NotifyStatus.Failed);
            }
        }
    };

    return [btnText(notifyStatus), notifyFunc]
}

function NotifyAdminCTA(props: Props) {
    const [status, notify] = useNotifyAdmin(props);
    const {formatMessage} = useIntl();

    return (
        <>
            {props.ctaText ? (
                <span>
                    <StyledA
                        id='notify_admin_cta'
                        onClick={notify}
                    >
                        {status}
                    </StyledA>
                </span>
            ) : (
                <Span>
                    {formatMessage({id: 'pricing_modal.wantToUpgrade', defaultMessage: 'Want to upgrade? '})}
                    <StyledA
                        id='notify_admin_cta'
                        onClick={notify}
                    >
                        {status}
                    </StyledA>
                </Span>
            )}
        </>);
}

export default NotifyAdminCTA;
