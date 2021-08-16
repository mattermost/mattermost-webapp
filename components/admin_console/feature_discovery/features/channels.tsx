// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {t} from 'utils/i18n';

import FeatureDiscovery from '../index';

import ChannelsSVG from './images/channels_svg';

const ChannelsFeatureDiscovery: React.FC = () => {
    return (
        <FeatureDiscovery
            featureName='channels'
            titleID='admin.channels_feature_discovery.title'
            titleDefault='Create read-only channels with Mattermost Professional'
            copyID='admin.channels_feature_discovery.copy'
            copyDefault={'Decide which channels should be public, private, read-only, or react-only.'}
            learnMoreURL='https://docs.mattermost.com/deployment/team-channel-management.html'
            featureDiscoveryImage={<ChannelsSVG/>}
        />
    );
};

t('admin.channels_feature_discovery.title');
t('admin.channels_feature_discovery.copy');

export default ChannelsFeatureDiscovery;
