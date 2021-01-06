// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {Fragment, FC, InputHTMLAttributes, forwardRef} from 'react';

import classNames from 'classnames';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    className: string;
    defaultValue?: string;
    maxLength: number;
}

export type Ref = HTMLInputElement;

const MaxLengthInput: FC<InputProps> = forwardRef<Ref, InputProps>(
    ({className, defaultValue, maxLength, ...props}: InputProps, ref) => {
        const excess: number = defaultValue ? defaultValue.length - maxLength : 0;

        const styles: string = classNames({
            [className]: Boolean(className),
            'has-error': excess > 0,
        });

        return (
            <Fragment>
                <input
                    className={styles}
                    defaultValue={defaultValue}
                    ref={ref}
                    {...props}
                />
                {excess > 0 && (
                    <span className='max-length'>
                        {'-'}
                        {excess}
                    </span>
                )}
            </Fragment>
        );
    },
);

export default MaxLengthInput;
