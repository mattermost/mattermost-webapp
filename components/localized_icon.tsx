// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {HTMLAttributes} from 'react';
import {useIntl, MessageDescriptor} from 'react-intl';
import {PrimitiveType, FormatXMLElementFn} from 'intl-messageformat';

type Props = Omit<HTMLAttributes<HTMLSpanElement | HTMLElement>, 'title' | 'component'> & {
    component?: 'i' | 'span';
    title: MessageDescriptor & {
        values?: Record<string, PrimitiveType | FormatXMLElementFn<string, string>>;
    },
}

const LocalizedIcon = React.forwardRef((props: Props, ref?: React.Ref<HTMLSpanElement | HTMLElement>) => {
    const {
        component: Component = 'i',
        title: {
            id,
            defaultMessage,
            values,
        },
        ...otherProps
    } = props;

    if (Component !== 'i' && Component !== 'span') {
        return null;
    }

    const {formatMessage} = useIntl();

    return (
        <Component
            {...otherProps}
            ref={ref}
            title={formatMessage({id, defaultMessage}, values)}
        />
    );
});
LocalizedIcon.displayName = 'LocalizedIcon';

export default LocalizedIcon;
