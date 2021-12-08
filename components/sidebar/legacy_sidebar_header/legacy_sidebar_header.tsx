// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import StatusDropdown from 'components/status_dropdown';

import SidebarHeaderDropdown from './dropdown';

type Props = {
    isMobileView: boolean;
}

export default function LegacySidebarHeader(props: Props) {
    const intl = useIntl();
    const ariaLabel = intl.formatMessage({id: 'accessibility.sections.lhsHeader', defaultMessage: 'team menu region'});

    return (
        <div
            id='lhsHeader'
            aria-label={ariaLabel}
            tabIndex={-1}
            role='application'
            className='SidebarHeader team__header theme a11y__region'
            data-a11y-sort-order='5'
        >
            <div
                className='d-flex'
            >
                {!props.isMobileView && <StatusDropdown/>}
                <SidebarHeaderDropdown/>
            </div>
        </div>
    );
}
