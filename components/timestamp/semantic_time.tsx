// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, ReactNode, memo} from 'react';

type Props = {
    value: Date;
    className?: string;
    label?: string;
    children?: ReactNode;
};

const SemanticTime: FC<Props> = ({
    value,
    className,
    label = value.toLocaleString(),
    children,
}: Props) => {
    return (
        <time
            aria-label={label}
            dateTime={value.toISOString()}
            className={className}
        >
            {children}
        </time>
    );
};

export default memo(SemanticTime);
