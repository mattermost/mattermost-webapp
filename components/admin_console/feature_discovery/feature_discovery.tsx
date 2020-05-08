// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import './feature_discovery.scss';

type Props = {
    titleID: string;
    titleDefault: string;

    copyID: string;
    copyDefault: string;

    primaryURL: string;
    secondaryURL: string;

    imgPath: string;
}

const FeatureDiscovery: React.FC<Props> = (props: Props) => {
    const redirectPrimary = (event: React.SyntheticEvent) => {
        event.preventDefault();
        window.open(props.primaryURL);
    };

    const redirectSecondary = (event: React.SyntheticEvent) => {
        event.preventDefault();
        window.open(props.secondaryURL);
    };

    return (
        <div className='FeatureDiscovery'>

            <div className='FeatureDiscovery_copyWrapper'>
                <div
                    className='FeatureDiscovery_title'
                    data-testid='featureDiscovery_title'
                >
                    <FormattedMessage
                        id={props.titleID}
                        defaultMessage={props.titleDefault}
                    />
                </div>
                <div className='FeatureDiscovery_copy'>
                    <FormattedMessage
                        id={props.copyID}
                        defaultMessage={props.copyDefault}
                    />
                </div>
                <button
                    className='btn'
                    onClick={redirectPrimary}
                >
                    <FormattedMessage
                        id='admin.ldap_feature_discovery.call_to_action.primary'
                        defaultMessage=''
                    />
                </button>
                <button
                    className='btn btn-secondary'
                    onClick={redirectSecondary}
                >
                    <FormattedMessage
                        id='admin.ldap_feature_discovery.call_to_action.secondary'
                        defaultMessage=''
                    />
                </button>
            </div>

            <div className='FeatureDiscovery_imageWrapper'>
                <img
                    className='FeatureDiscovery_image'
                    src={props.imgPath}
                    alt='Feature Discovery Image'
                />
            </div>

        </div>
    );
};

export default FeatureDiscovery;