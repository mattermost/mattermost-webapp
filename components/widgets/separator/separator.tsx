// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';
import './separator.scss';

type Props = {
    className: string;
    children?: ReactNode;
};

export default class Separator extends React.PureComponent<Props> {
    public render() {
        const {children, className} = this.props;
        return (
            <div className={className}>
                <hr className='separator__hr'/>
                {children && (
                    <div className='separator__text'>
                        {children}
                    </div>
                )}
            </div>
        );
    }
}
