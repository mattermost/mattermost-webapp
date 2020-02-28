// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferPropTypes<T> = T extends React.Component<infer P, any> ? P : never;

type Props = Omit<JSX.IntrinsicElements['input'], 'placeholder'> & {
    placeholder: InferPropTypes<FormattedMessage>;
};

const LocalizedInput = React.forwardRef((props: Props, ref?: React.Ref<HTMLInputElement>) => {
    const {placeholder, ...otherProps} = props;

    return (
        <FormattedMessage
            id={placeholder.id}
            defaultMessage={placeholder.defaultMessage}
            values={placeholder.values}
        >
            {(localizedPlaceholder) => (
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
