// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef} from 'react';

import styled from 'styled-components';

export interface ModalBodyWithIllustrationProps {
    className?: string;
    illustration: [string, string];
    children: React.ReactNode;
}

const Illustration = styled.img`
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.4s linear;
    margin-top: 17px;
`;

const ModalBodyWithIllustration = (props: ModalBodyWithIllustrationProps) => {
    const IllustrationRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        setTimeout(() => {
            IllustrationRef.current?.classList.add('active');
        }, 400);
    }, [props.illustration[0]]);

    return (
        <div className={props.className}>
            <div className='content-side'>
                {props.children}
            </div>
            <Illustration
                className={props.illustration[0]}
                ref={IllustrationRef}
                src={props.illustration[1]}
            />
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

    ${Illustration}.active {
        opacity: 1;
        visibility: visible;
    }

    img {
        box-shadow: var(--elevation-2);
        border-radius: 8px;
    }
`;

export default StyledModalBodyWithIllustration;

