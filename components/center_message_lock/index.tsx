// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch, useSelector} from 'react-redux'

import './index.scss';

interface Props{}

export default function CenterMessageLock(props: Props) {
    const dispatch = useDispatch();

    return <div className="CenterMessageLock">
        <div className="CenterMessageLock__left">
            <i className="icon icon-eye-outline"/>
        </div>
        <div className="CenterMessageLock__right">
        </div>
    </div>
}
