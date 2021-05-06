// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {t} from 'utils/i18n';

import FeatureDiscovery from '../index';

import SystemRolesSVG from './images/system_roles_svg';

const SystemRolesFeatureDiscovery: React.FC = () => {
    return (
        <FeatureDiscovery
            featureName='system_roles'
            titleID='admin.system_roles_feature_discovery.title'
            titleDefault='Provide controlled access to the System Console with Mattermost Enterprise E20'
            copyID='admin.system_roles_feature_discovery.copy'
            copyDefault={'Use System Roles to give designated users read and/or write access to select sections of System Console.'}
            learnMoreURL='https://docs.mattermost.com/deployment/admin-roles.html'
            featureDiscoveryImage={<SystemRolesSVG/>}
        />
    );
};

t('admin.system_roles_feature_discovery.title');
t('admin.system_roles_feature_discovery.copy');

export default SystemRolesFeatureDiscovery;
