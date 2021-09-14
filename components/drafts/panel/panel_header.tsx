// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Timestamp from 'components/timestamp';
import Label, {LabelType} from 'components/label/label';

import './panel_header.scss';

const TIMESTAMP_PROPS = {
    day: 'numeric',
    useSemanticOutput: false,
    useTime: false,
    units: [
        'now',
        'minute',
        'hour',
        'day',
        'week',
        'month',
        'year',
    ],
};

type Props = {
    actions: React.ReactNode;
    hover: boolean;
    timestamp: Date;
    title: React.ReactNode;
}

function PanelHeader({
    actions,
    hover,
    timestamp,
    title,
}: Props) {
    return (
        <header className='PanelHeader'>
            <div className='PanelHeader__left'>
                {title}
            </div>
            <div className='PanelHeader__right'>
                <div style={{display: hover ? 'inline-flex' : 'none'}}>
                    {actions}
                </div>
                <div style={{display: hover ? 'none' : 'inline-flex'}}>
                    <div className='PanelHeader__timestamp'>
                        {Boolean(timestamp) && (
                            <Timestamp
                                value={new Date(timestamp).getTime()}
                                {...TIMESTAMP_PROPS}
                            />
                        )}
                    </div>
                    <div>
                        <Label type={LabelType.Danger}>
                            {'DRAFT'}
                        </Label>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default PanelHeader;
