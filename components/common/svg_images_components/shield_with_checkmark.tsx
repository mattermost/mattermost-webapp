// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type SvgProps = {
    width?: number;
    height?: number;
}

const Svg = (props: SvgProps) => (
    <svg
        width={props.width?.toString() || '102'}
        height={props.height?.toString() || '123'}
        viewBox='0 0 102 123'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            d='M101.675 27.9958L99.2946 16.0841C98.9367 14.3239 97.8957 12.7705 96.3927 11.7537C85.2266 4.1723 70.423 0.223633 51.0193 0.223633C31.6156 0.223633 16.7987 4.17233 5.67264 11.7801C4.17376 12.8008 3.13398 14.3524 2.7708 16.1104L0.336967 27.9958C0.184635 28.743 0.245121 29.5171 0.511798 30.2325C0.778474 30.948 1.24096 31.5769 1.84808 32.0498C5.05752 34.5111 6.51514 37.7622 7.19714 41.8688C7.96339 46.1871 7.78096 50.6168 6.6622 54.8599C-3.27367 93.2541 13.4555 110.72 50.9524 122.777C88.3958 110.72 105.165 93.2541 95.2293 54.8599C94.1175 50.6158 93.9351 46.1876 94.6944 41.8688C95.4299 37.7622 96.8875 34.5111 100.043 32.0498C100.675 31.593 101.162 30.9705 101.451 30.2536C101.74 29.5366 101.817 28.7542 101.675 27.9958Z'
            fill='#CC8F00'
        />
        <path
            d='M51.019 113.063C16.9455 101.507 8.05264 87.1071 15.8088 57.1236C17.2606 51.6118 17.4932 45.8575 16.4908 40.2496C15.7615 35.2997 13.534 30.681 10.0986 26.9954L11.7568 18.8348C21.4921 12.4906 34.3433 9.41064 51.019 9.41064C67.6947 9.41064 80.5324 12.4906 90.2677 18.8348L91.9259 26.9954C88.4947 30.6822 86.2718 35.301 85.5471 40.2496C84.5448 45.8575 84.7773 51.6118 86.2291 57.1236C93.9451 87.0939 85.0925 101.572 51.019 113.063Z'
            fill='var(--away-indicator)'
        />
        <path
            d='M51.019 113.063C16.9455 101.507 8.05264 87.1071 15.8088 57.1236C17.2606 51.6118 17.4932 45.8575 16.4908 40.2496C15.7615 35.2997 13.534 30.681 10.0986 26.9954L11.7568 18.8348C21.4921 12.4906 34.3433 9.41064 51.019 9.41064C67.6947 9.41064 80.5324 12.4906 90.2677 18.8348L91.9259 26.9954C88.4947 30.6822 86.2718 35.301 85.5471 40.2496C84.5448 45.8575 84.7773 51.6118 86.2291 57.1236C93.9451 87.0939 85.0925 101.572 51.019 113.063Z'
            fill='var(--away-indicator)'
        />
        <path
            d='M51.019 52.4511V9.43701C34.3433 9.43701 21.4921 12.5169 11.7568 18.8611L10.0986 27.0217C13.534 30.7073 15.7615 35.3261 16.4908 40.276C17.2085 44.307 17.2852 48.4233 16.7181 52.4774L51.019 52.4511Z'
            fill='var(--away-indicator)'
        />
        <path
            d='M51.0195 113.063C85.093 101.573 93.9457 87.0941 86.2297 57.1237C85.8321 55.5847 85.5241 54.0247 85.3069 52.4512H51.0195V113.063Z'
            fill='var(--away-indicator)'
        />
        <path
            d='M15.809 57.1237C8.05289 87.1072 16.9457 101.507 51.0192 113.063V52.4512H16.7184C16.5058 54.0245 16.2022 55.5845 15.809 57.1237Z'
            fill='#FFD470'
        />
        <path
            d='M51.0195 9.43701V52.4774H85.3069C84.7377 48.423 84.8189 44.3057 85.5476 40.276C86.2723 35.3274 88.4952 30.7085 91.9264 27.0217L90.2682 18.8611C80.5731 12.4906 67.6819 9.43701 51.0195 9.43701Z'
            fill='#FFD470'
        />
        <path
            d='M71.0644 38.9336L43.4633 68.8118L35.4531 62.8361H31L43.4633 82.7505L75.5175 38.9336H71.0644Z'
            fill='#6F370B'
        />
    </svg>
);

export default Svg;
