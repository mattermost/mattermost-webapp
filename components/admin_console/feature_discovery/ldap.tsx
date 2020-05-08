// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {t} from 'utils/i18n';
import ldap from 'images/feature-discovery/ldap.png';

import FeatureDiscovery from './feature_discovery';

const LDAPFeatureDiscovery: React.FC = () => {
    return (
        <FeatureDiscovery
            titleID='admin.ldap_feature_discovery.title'
            titleDefault='Integrate Active Directory / LDAP with Mattermost Enterprise E10'
            copyID='admin.ldap_feature_discovery.copy'
            copyDefault={'When you connect Mattermost with your organization\'s Active Directory / LDAP, users can log in without having to create new usernames and passwords.'}
            primaryURL='https://mattermost.com/trial/'
            secondaryURL='https://docs.mattermost.com/deployment/sso-ldap.html'
            imgPath={ldap}
        />
    );
};

t('admin.ldap_feature_discovery.title');
t('admin.ldap_feature_discovery.copy');

export default LDAPFeatureDiscovery;