// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

type Props = {
    placeholder: {
        id: string;
        defaultMessage: string;
        values?: {string: any};
    };
    value?: string;
};

const LocalizedInput = React.forwardRef((props: Props, ref?: React.Ref<HTMLInputElement>) => {
    const {placeholder, ...otherProps} = props;

    return (
        <FormattedMessage
            id={placeholder.id}
            defaultMessage={placeholder.defaultMessage}
            values={placeholder.values}
        >
            {(localizedPlaceholder: (string | JSX.Element)) => (
                <input
                    {...otherProps}
                    ref={ref}
                    placeholder={localizedPlaceholder as string}
                />
            )}
        </FormattedMessage>
    );
});
LocalizedInput.displayName = 'LocalizedInput';

export default LocalizedInput;
