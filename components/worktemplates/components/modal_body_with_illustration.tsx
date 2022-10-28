// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

export interface ModalBodyWithIllustrationProps {
    className?: string;
    illustration: string;
    children: React.ReactNode;
}

const ModalBodyWithIllustration = (props: ModalBodyWithIllustrationProps) => {
    return (
        <div className={props.className}>
            <div className='content-side'>
                {props.children}
            </div>
            <div style={{marginTop: 17}}>
                <img
                    src={props.illustration}
                />
            </div>
        </div>
    );
};

const StyledModalBodyWithIllustration = styled(ModalBodyWithIllustration)`
    display: flex;

    .content-side {
        width: 387px;
        height: 416px;
        padding-right: 32px;
    }

    img {
        box-shadow: var(--elevation-2);
        border-radius: 8px;
    }
`;

export default StyledModalBodyWithIllustration;

