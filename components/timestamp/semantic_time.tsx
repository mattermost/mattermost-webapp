// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, ReactNode, memo, TimeHTMLAttributes} from 'react';
import {DateTime} from 'luxon';

export type Props = {
    value: Date;
    children?: ReactNode;
} & TimeHTMLAttributes<HTMLTimeElement>;

const SemanticTime: FC<Props> = ({
    value,
    children,
    ...props
}: Props) => {
    return (
        <time
            {...props}
            dateTime={DateTime.fromJSDate(value).toLocal().toISO({includeOffset: false})}
        >
            {children}
        </time>
    );
};

export default memo(SemanticTime);
