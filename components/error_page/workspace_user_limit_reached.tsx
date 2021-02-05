// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import computerWithAlert from 'images/cloud/computer-with-alert.svg';
import mattermostCloud from 'images/cloud/mattermost-cloud.svg';
import wavesBackground from 'images/cloud/waves.svg';
import blueDots from 'images/cloud/blue.svg';

const WorkspaceUserLimitReached: React.FC = () => {
    return (
        <div className='ErrorPage__container_max_free_users'>
            <div className='ErrorPage__mattermostCloudImg'>
                <img src={mattermostCloud}/>
            </div>
            <div className='ErrorPage__computerWithAlertImg'>
                <img src={computerWithAlert}/>
            </div>
            <div className='ErrorPage__maxFreeUsersReachedTitle'>
                <FormattedMessage
                    id='error.maxFreeUsersReached.title'
                    defaultMessage='This workspace has reached the user limit.'
                />
            </div>
            <div className='ErrorPage__maxFreeUsersReachedDescription'>
                <FormattedMessage
                    id='error.maxFreeUsersReached.description'
                    defaultMessage='New users cannot be added to this workspace because it has reached the user limit for the free version of Mattermost Cloud. The system administrator has been notified'
                />
            </div>
            <div>
                <img
                    className='waves'
                    src={wavesBackground}
                />
                <img
                    className='blue-dots'
                    src={blueDots}
                />
            </div>
        </div>
    );
};

export default WorkspaceUserLimitReached;
