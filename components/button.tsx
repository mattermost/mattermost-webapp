// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {HTMLAttributes} from 'react';

import classNames from 'classnames';

import LoadingWrapper from 'components/widgets/loading/loading_wrapper';

type Props = {
    loading?: boolean;
    id?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    loadingMessage?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    extraClasses?: string;
} & HTMLAttributes<HTMLButtonElement>;

export default class SaveButton extends React.PureComponent<Props> {
    public static defaultProps: Partial<Props> = {
        className: 'btn-primary',
        disabled: false,
    }

    public render() {
        const {
            loading = false,
            loadingMessage,
            className,
            children,
            ...props
        } = this.props;

        return (
            <button
                type='submit'
                data-testid='saveSetting'
                className={classNames('btn', className)}
                {...props}
            >
                <LoadingWrapper
                    loading={loading}
                    text={loadingMessage}
                >
                    <span>{children}</span>
                </LoadingWrapper>
            </button>
        );
    }
}
