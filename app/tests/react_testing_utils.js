// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {render} from '@testing-library/react';
import {IntlProvider} from 'react-intl';

export const renderWithIntl = (component, locale = 'en') => {
    return render(<IntlProvider locale={locale}>{component}</IntlProvider>);
};
