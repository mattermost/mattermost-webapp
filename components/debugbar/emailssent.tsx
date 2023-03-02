// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useState} from 'react';
import {useSelector} from 'react-redux';
import cn from 'classnames';
import {FixedSizeList as List} from 'react-window';

import {getEmailsSent} from 'mattermost-redux/selectors/entities/debugbar';

import {GenericModal} from '@mattermost/components';
import {DebugBarEmailSent} from '@mattermost/types/debugbar';

import Time from './time';

type Props = {
    filter: string;
    height: number;
    width: number;
}

type RowProps = {
    data: DebugBarEmailSent[];
    index: number;
    style: any;
}

function EmailsSent({filter, height, width}: Props) {
    const [viewEmail, setViewEmail] = useState<DebugBarEmailSent|null>(null);
    let emails = useSelector(getEmailsSent);
    if (filter !== '') {
        emails = emails.filter((v) => JSON.stringify(v).indexOf(filter) !== -1);
    }

    function Row({data, index, style}: RowProps) {
        return (
            <div
                key={data[index].time + '_' + data[index].subject}
                className='DebugBarTable__row'
                style={style}
                onDoubleClick={() => setViewEmail(data[index])}
            >
                <div className={cn('time', {error: data[index].err})}>
                    <Time time={data[index].time}/>
                </div>
                <div className='address pl-2'>{data[index].to}</div>
                <div className='address pl-2'>{data[index].cc}</div>
                <div className='subject pl-2'>
                    {data[index].subject}
                </div>
            </div>
        );
    }

    let modal;
    if (viewEmail !== null) {
        modal = (
            <GenericModal
                onExited={() => setViewEmail(null)}
                show={true}
                modalHeaderText='Email'
                compassDesign={true}
                className='DebugBarModal'
            >
                <div>
                    <div>
                        <b>{'To:'}</b>
                        <span>{viewEmail.to}</span>
                    </div>
                    <div>
                        <b>{'Cc:'}</b>
                        <span>{viewEmail.cc}</span>
                    </div>
                    <div>
                        <b>{'Subject:'}</b>
                        <span>{viewEmail.subject}</span>
                    </div>
                    <h3>{'Body:'}</h3>
                    <div
                        dangerouslySetInnerHTML={{__html: viewEmail.htmlBody}}
                    />
                </div>
            </GenericModal>
        );
    }

    return (
        <div className='DebugBarTable'>
            {modal}
            <List
                itemData={emails}
                itemCount={emails.length}
                itemSize={50}
                height={height}
                width={width - 2}
            >
                {Row}
            </List>
        </div>
    );
}

export default memo(EmailsSent);
