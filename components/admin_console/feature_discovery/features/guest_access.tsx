// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {t} from 'utils/i18n';
import saml from 'images/feature-discovery/saml.png';

import FeatureDiscovery from '../index';

const GuestAccessFeatureDiscovery: React.FC = () => {
    return (
        <FeatureDiscovery
            featureName='guest_access'
            titleID='admin.guest_access_feature_discovery.title'
            titleDefault='Enable guest accounts with Mattermost Enterprise E10'
            copyID='admin.guest_access_feature_discovery.copy'
            copyDefault={'Collaborate with users outside of your organization while tightly controlling their access channels and team members.'}
            learnMoreURL='https://docs.mattermost.com/deployment/guest-accounts.html'
            imgPath={saml}
        />
    );
};

t('admin.guest_access_feature_discovery.title');
t('admin.guest_access_feature_discovery.copy');

export default GuestAccessFeatureDiscovery;
