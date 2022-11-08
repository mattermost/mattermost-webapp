// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import styled from 'styled-components';

export interface ModalBodyWithProps {
    className?: string;
    children: React.ReactNode;
}

const ModalBody = (props: ModalBodyWithProps) => {
    return (
        <div className={props.className}>
            <div className='content-side'>
                {props.children}
            </div>

        </div>
    );
};

const StyledModalBody = styled(ModalBody)`
    display: flex;

    .content-side {
        width: 387px;
        height: 416px;
        padding-right: 32px;
    }
`;

export default StyledModalBody;

