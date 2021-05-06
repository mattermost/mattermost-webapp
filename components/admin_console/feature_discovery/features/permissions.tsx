// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {t} from 'utils/i18n';

import FeatureDiscovery from '../index';

import PermissionsSVG from './images/permissions_svg';

const PermissionsFeatureDiscovery: React.FC = () => {
    return (
        <FeatureDiscovery
            featureName='permissions'
            titleID='admin.permissions_feature_discovery.title'
            titleDefault='Set role-based permissions with Mattermost Enterprise E10'
            copyID='admin.permissions_feature_discovery.copy'
            copyDefault={'Decide who can perform an array of actions such as creating channels, inviting people, managing and archiving channels, managing webhooks, and more in Permission Schemes.'}
            learnMoreURL='https://docs.mattermost.com/deployment/advanced-permissions.html'
            featureDiscoveryImage={<PermissionsSVG/>}
        />
    );
};

t('admin.permissions_feature_discovery.title');
t('admin.permissions_feature_discovery.copy');

export default PermissionsFeatureDiscovery;
