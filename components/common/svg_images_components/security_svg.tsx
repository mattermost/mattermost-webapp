// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as React from 'react';

type SvgProps = {
    width?: number;
    height?: number;
}

const SvgComponent = (props: SvgProps) => (
    <svg
        width={props.width ? props.width.toString() : '376'}
        height={props.height ? props.height.toString() : '376'}
        fill='var(--center-channel-bg)'
        viewBox='0 0 376 376'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            d='M293.855 118.013L288.883 93.1307C288.135 89.4539 285.961 86.209 282.821 84.0851C259.496 68.2483 228.574 60 188.041 60C147.509 60 116.558 68.2484 93.3171 84.1401C90.1861 86.2723 88.0141 89.5135 87.2555 93.1857L82.1715 118.013C81.8533 119.574 81.9796 121.191 82.5367 122.685C83.0937 124.18 84.0598 125.493 85.328 126.481C92.0322 131.623 95.077 138.414 96.5016 146.992C98.1022 156.013 97.7211 165.266 95.3842 174.129C74.6292 254.33 109.575 290.815 187.902 316C266.117 290.815 301.146 254.33 280.391 174.129C278.069 165.264 277.688 156.014 279.274 146.992C280.81 138.414 283.855 131.623 290.447 126.481C291.766 125.527 292.785 124.227 293.387 122.729C293.99 121.232 294.152 119.597 293.855 118.013Z'
            fill='#CC8F00'
        />
        <path
            d='M188.042 295.709C116.866 271.569 98.2896 241.49 114.491 178.858C117.524 167.345 118.01 155.324 115.916 143.61C114.393 133.27 109.74 123.622 102.563 115.924L106.027 98.877C126.363 85.6247 153.208 79.191 188.042 79.191C222.875 79.191 249.692 85.6247 270.028 98.877L273.492 115.924C266.324 123.625 261.681 133.273 260.167 143.61C258.073 155.324 258.559 167.345 261.592 178.858C277.71 241.463 259.217 271.707 188.042 295.709Z'
            fill='#FFBC1F'
        />
        <path
            d='M188.042 295.709C116.866 271.569 98.2896 241.49 114.491 178.858C117.524 167.345 118.01 155.324 115.916 143.61C114.393 133.27 109.74 123.622 102.563 115.924L106.027 98.877C126.363 85.6247 153.208 79.191 188.042 79.191C222.875 79.191 249.692 85.6247 270.028 98.877L273.492 115.924C266.324 123.625 261.681 133.273 260.167 143.61C258.073 155.324 258.559 167.345 261.592 178.858C277.71 241.463 259.217 271.707 188.042 295.709Z'
            fill='#FFBC1F'
        />
        <path
            d='M188.042 169.098V79.2461C153.208 79.2461 126.363 85.6797 106.027 98.932L102.563 115.979C109.74 123.677 114.393 133.326 115.916 143.665C117.415 152.086 117.575 160.684 116.391 169.153L188.042 169.098Z'
            fill='#FFBC1F'
        />
        <path
            d='M188.041 295.709C259.217 271.706 277.709 241.463 261.591 178.858C260.761 175.643 260.117 172.384 259.664 169.098H188.041V295.709Z'
            fill='#FFBC1F'
        />
        <path
            d='M114.492 178.858C98.29 241.49 116.866 271.569 188.042 295.709V169.098H116.391C115.947 172.384 115.313 175.643 114.492 178.858Z'
            fill='#FFD470'
        />
        <path
            d='M188.041 79.2461V169.153H259.664C258.475 160.683 258.644 152.083 260.166 143.665C261.68 133.328 266.324 123.68 273.491 115.979L270.027 98.932C249.775 85.6247 222.847 79.2461 188.041 79.2461Z'
            fill='#FFD470'
        />
        <path
            d='M229.914 140.861L172.258 203.273L155.526 190.791H146.224L172.258 232.39L239.216 140.861H229.914Z'
            fill='#6F370B'
        />
    </svg>
);

export default SvgComponent;
