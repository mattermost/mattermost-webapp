// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {useIntl} from 'react-intl';

import Header from 'components/widgets/header';

const IntegrationsTabHeader = () => {
    const {formatMessage} = useIntl();

    return (
        <Header
            level={2}
            className='IntegrationsTab__header'
            heading={formatMessage({
                id: 'integrationsTab.heading',
                defaultMessage: 'Integrations',
            })}
            subtitle={formatMessage({
                id: 'integrationsTab.subtitle',
                defaultMessage: 'Insights from the plugins you\'ve added will show here',
            })}
        />
    );
};

export default memo(IntegrationsTabHeader);
