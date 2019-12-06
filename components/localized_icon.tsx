// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

type Props = {
    component?: string;
    title: {
        id: string;
        defaultMessage: string;
        values?: {string: any};
    };
}

const LocalizedIcon = React.forwardRef((props: Props, ref?: React.Ref<HTMLIElement>) => {
    const {
        component: Component,
        title,
        ...otherProps
    } = props;

    return (
        <FormattedMessage
            id={title.id}
            defaultMessage={title.defaultMessage}
            values={title.values}
        >
            {(localizedTitle: (string | JSX.Element)) => (
                <Component
                    {...otherProps}
                    ref={ref}
                    title={localizedTitle as string}
                />
            )}
        </FormattedMessage>
    );
});
LocalizedIcon.defaultProps = {
    component: 'i',
};
LocalizedIcon.displayName = 'LocalizedIcon';

export default LocalizedIcon;
