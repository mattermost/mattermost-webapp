// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl, IntlShape} from 'react-intl';

type Props = {
    placeholder: {
        id: string;
        defaultMessage: string;
    };
    value?: string;
    intl: IntlShape;
    forwardedRef?: React.RefObject<HTMLInputElement>;
};

class LocalizedInput extends React.Component<Props> {
    public shouldComponentUpdate(nextProps: Props): boolean {
        return nextProps.value !== this.props.value ||
            nextProps.placeholder.id !== this.props.placeholder.id ||
            nextProps.placeholder.defaultMessage !== this.props.placeholder.defaultMessage;
    }

    public render(): JSX.Element {
        const {formatMessage} = this.props.intl;
        const {placeholder, forwardedRef, ...otherProps} = this.props;
        const placeholderString: string = formatMessage(placeholder);

        return (
            <input
                {...otherProps}
                ref={forwardedRef}
                placeholder={placeholderString}
            />
        );
    }
}

export default injectIntl(LocalizedInput, {forwardRef: true});
