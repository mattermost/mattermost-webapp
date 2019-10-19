// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {intlShape} from 'react-intl';

type Props = {
    placeholder: {
        id: string;
        defaultMessage: string;
    };
    value?: string;
}

export default class LocalizedInput extends React.Component<Props> {
    public static contextTypes = {
        intl: intlShape.isRequired,
    };
    public input: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();

    public get value(): string {
        return this.input.current ? this.input.current.value : '';
    }

    public set value(value: string) {
        if (this.input.current) {
            this.input.current.value = value;
        }
    }

    public focus = (): void => {
        if (this.input.current) {
            this.input.current.focus();
        }
    };

    public shouldComponentUpdate(nextProps: Props): boolean {
        return nextProps.value !== this.props.value ||
            nextProps.placeholder.id !== this.props.placeholder.id ||
            nextProps.placeholder.defaultMessage !== this.props.placeholder.defaultMessage;
    }

    public render(): JSX.Element {
        const {formatMessage} = this.context.intl;
        const {placeholder, ...otherProps} = this.props;
        const placeholderString: string = formatMessage(placeholder);

        return (
            <input
                ref={this.input}
                {...otherProps}
                placeholder={placeholderString}
            />
        );
    }
}