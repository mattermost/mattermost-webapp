// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';

import {Client4} from 'mattermost-redux/client';
import {NotifyAdminRequest} from '@mattermost/types/cloud';

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

type HookProps = {
    ctaText?: React.ReactNode;
    preTrial?: boolean;
}

type Props = HookProps & {
    notifyRequestData: NotifyAdminRequest;
}

export function useNotifyAdmin<T = HTMLAnchorElement | HTMLButtonElement>(props: HookProps, reqData: NotifyAdminRequest): [React.ReactNode, (e: React.MouseEvent<T, MouseEvent>) => void] {
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
            await Client4.notifyAdminToUpgrade(reqData);
            setStatus(NotifyStatus.Success);
        } catch (error) {
            if (error && error.status_code === 403) {
                setStatus(NotifyStatus.AlreadyComplete);
            } else {
                setStatus(NotifyStatus.Failed);
            }
        }
    };

    return [btnText(notifyStatus), notifyFunc];
}

function NotifyAdminCTA(props: Props) {
    const [status, notify] = useNotifyAdmin(props, props.notifyRequestData);
    const {formatMessage} = useIntl();
    let title = formatMessage({id: 'pricing_modal.wantToUpgrade', defaultMessage: 'Want to upgrade? '});
    if (props.preTrial) {
        title = formatMessage({id: 'pricing_modal.wantToTry', defaultMessage: 'Want to try? '});
    }

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
                    {title}
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
