// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, ReactNode, memo, TimeHTMLAttributes} from 'react';

export type Props = {
    value: Date;
    children?: ReactNode;
} & TimeHTMLAttributes<HTMLTimeElement>;

const SemanticTime: FC<Props> = ({
    value,
    children,
    'aria-label': label = value.toLocaleString(),
    ...props
}: Props) => {
    return (
        <time
            {...props}
            aria-label={label}
            dateTime={value.toISOString()}
        >
            {children}
        </time>
    );
};

export default memo(SemanticTime);
