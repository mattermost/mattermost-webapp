// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import * as React from 'react';

type Props = {|
    children: React.Node
|};

const AdminHeader = (props: Props) => (
    <h3 className='admin-console-header'>
        {props.children}
    </h3>
);

export default AdminHeader;
