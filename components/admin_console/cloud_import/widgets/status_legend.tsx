// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';
import {FormattedMessage} from 'react-intl';
import './status_legend.scss';

import loadingIcon from 'images/cloud_spinner.gif';

type StatusLegendProps = {
    status: string;
}

const StatusLegend = (props: StatusLegendProps) => {
    switch (props.status) {
    case 'failed':
        return (
            <div className='StatusLegend failed'>
                <i className='icon icon-alert-outline'/>
                <FormattedMessage
                    id='admin.general.failed'
                    defaultMessage='Failed'
                />
            </div>
        );
    case 'completed':
        return (
            <div className='StatusLegend completed'>
                <i className='icon icon-check-circle-outline'/>
                <FormattedMessage
                    id='admin.general.completed'
                    defaultMessage='Completed'
                />
            </div>
        );
    default:
        return (
            <div className='StatusLegend in_progress'>
                <img
                    src={loadingIcon}
                    className='spinner'
                />
                <FormattedMessage
                    id='admin.general.inProgress'
                    defaultMessage='In Progress'
                />
            </div>
        );
    }
};

export default memo(StatusLegend);
