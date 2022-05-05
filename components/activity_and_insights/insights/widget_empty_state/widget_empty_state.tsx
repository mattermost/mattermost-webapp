// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

type Props = {
    emptyMessage: JSX.Element;
}

const WidgetEmptyState = (props: Props) => {

    return (
        <div className='empty-state'>
            <div className='empty-state-emoticon'>
                <i className='icon icon-emoticon-outline'/>
            </div>
            <div className='empty-state-text'>
                {props.emptyMessage}
            </div>
        </div>
    );
};

export default memo(WidgetEmptyState);
