// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {t} from 'utils/i18n';
import saml from 'images/feature-discovery/saml.png';

import FeatureDiscovery from './feature_discovery';

const SAMLFeatureDiscovery: React.FC = () => {
    return (
        <FeatureDiscovery
            titleID='admin.saml_feature_discovery.title'
            titleDefault='Integrate SAML 2.0 with Mattermost Enterprise E20'
            copyID='admin.saml_feature_discovery.copy'
            copyDefault={'When you connect Mattermost with your organization\'s single sign-on provider, users can access Mattermost without having to re-enter their credentials.'}
            primaryURL='https://mattermost.com/trial/'
            secondaryURL='https://docs.mattermost.com/deployment/sso-saml.html'
            imgPath={saml}
        />
    );
};

t('admin.saml_feature_discovery.title');
t('admin.saml_feature_discovery.copy');

export default SAMLFeatureDiscovery;