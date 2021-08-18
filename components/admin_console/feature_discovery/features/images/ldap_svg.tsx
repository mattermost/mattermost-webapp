// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type SvgProps = {
    width?: number;
    height?: number;
}

const LdapSVG = (props: SvgProps) => (
    <svg
        width={props.width ? props.width.toString() : '246'}
        height={props.height ? props.height.toString() : '220'}
        viewBox='0 0 246 220'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            d='M0.5 110C0.5 49.2487 49.7487 0 110.5 0H135.5C196.251 0 245.5 49.2487 245.5 110C245.5 170.751 196.251 220 135.5 220H110.5C49.7487 220 0.5 170.751 0.5 110Z'
            fill='#1C58D9'
            fillOpacity='0.04'
        />
        <path
            d='M109.6 163.657C137.518 165.444 161.588 144.352 163.363 116.545C165.138 88.7385 143.946 64.7477 116.029 62.9602C88.1117 61.1727 64.0413 82.2653 62.2661 110.072C60.491 137.879 81.6833 161.869 109.6 163.657Z'
            stroke='#1E325C'
            strokeWidth='0.91'
            strokeMiterlimit='10'
            strokeDasharray='10 10'
        />
        <path
            d='M112.264 170.928C144.191 170.928 170.073 145.131 170.073 113.308C170.073 81.4864 144.191 55.6895 112.264 55.6895C80.3371 55.6895 54.4551 81.4864 54.4551 113.308C54.4551 145.131 80.3371 170.928 112.264 170.928Z'
            stroke='#1E325C'
            strokeWidth='0.91'
            strokeMiterlimit='10'
            strokeDasharray='10 10'
        />
        <g clipPath='url(#clip0)'>
            <path
                d='M13.3868 169.629H97.2125C97.8322 169.622 98.4236 169.368 98.8574 168.924C99.2912 168.48 99.532 167.881 99.5269 167.259V110.992C99.532 110.37 99.2912 109.771 98.8574 109.327C98.4236 108.883 97.8322 108.629 97.2125 108.622H13.3868C13.0804 108.625 12.7778 108.689 12.4961 108.811C12.2144 108.932 11.9593 109.107 11.7452 109.328C11.5312 109.548 11.3624 109.808 11.2486 110.094C11.1347 110.379 11.0781 110.685 11.0818 110.992V167.296C11.0842 167.911 11.3272 168.5 11.7585 168.937C12.1897 169.373 12.7745 169.622 13.3868 169.629Z'
                fill='#202427'
            />
            <path
                d='M4.35394 177.937C4.35394 180.759 6.64027 183.581 9.44195 183.581H101.12C103.753 183.581 106.198 180.759 106.198 177.937H4.35394Z'
                fill='#202427'
            />
            <path
                d='M97.7185 169.667H12.8433L4.35394 177.927H106.208L97.7185 169.667Z'
                fill='#DCDCDC'
            />
            <path
                d='M94.9168 170.316H15.6919L12.8715 173.797H97.7466L94.9168 170.316Z'
                fill='#BEBDBE'
            />
            <path
                d='M64.0139 175.331H46.5948L45.2923 177.062H65.3164L64.0139 175.331Z'
                fill='#202427'
            />
            <path
                d='M94.3451 113.768H16.2634V164.521H94.3451V113.768Z'
                fill='#3D4247'
            />
            <path
                d='M55.2997 109.948C55.561 109.948 55.8164 110.026 56.0337 110.171C56.2509 110.317 56.4203 110.524 56.5203 110.767C56.6203 111.009 56.6464 111.276 56.5955 111.533C56.5445 111.79 56.4186 112.027 56.2339 112.212C56.0491 112.398 55.8137 112.524 55.5574 112.575C55.3011 112.626 55.0355 112.6 54.794 112.5C54.5526 112.399 54.3463 112.229 54.2011 112.011C54.0559 111.793 53.9785 111.537 53.9785 111.274C53.9785 110.922 54.1177 110.585 54.3654 110.336C54.6132 110.087 54.9493 109.948 55.2997 109.948Z'
                fill='#DCDCDC'
            />
            <path
                d='M62.6083 181.633H47.9533C47.7107 181.682 47.4601 181.673 47.2217 181.606C46.9834 181.539 46.764 181.417 46.5815 181.25C46.3989 181.082 46.2583 180.873 46.1711 180.641C46.0838 180.408 46.0524 180.159 46.0793 179.912H64.4167C64.4411 180.152 64.4102 180.395 64.3265 180.621C64.2428 180.848 64.1084 181.052 63.9338 181.218C63.7591 181.385 63.5488 181.509 63.319 181.58C63.0892 181.652 62.8461 181.67 62.6083 181.633Z'
                fill='#3D4247'
            />
            <path
                d='M70.9003 129.576L70.2105 126.063C70.1068 125.544 69.8052 125.085 69.3697 124.786C66.1344 122.55 61.8451 121.385 56.2229 121.385C50.6008 121.385 46.3076 122.55 43.0839 124.793C42.6496 125.094 42.3483 125.552 42.2431 126.07L41.5379 129.576C41.4937 129.796 41.5113 130.024 41.5885 130.235C41.6658 130.446 41.7998 130.632 41.9757 130.771C42.9056 131.497 43.328 132.456 43.5256 133.667C43.7476 134.94 43.6948 136.247 43.3706 137.498C40.4917 148.821 45.3389 153.972 56.2036 157.528C67.0527 153.972 71.9115 148.821 69.0326 137.498C68.7105 136.247 68.6577 134.941 68.8777 133.667C69.0908 132.456 69.5131 131.497 70.4275 130.771C70.6104 130.636 70.7518 130.453 70.8354 130.241C70.919 130.03 70.9415 129.799 70.9003 129.576Z'
                fill='#CC8F00'
            />
            <path
                d='M56.223 154.663C46.3503 151.255 43.7736 147.008 46.021 138.166C46.4416 136.54 46.509 134.843 46.2186 133.19C46.0073 131.73 45.3618 130.368 44.3665 129.281L44.8469 126.874C47.6677 125.003 51.3913 124.095 56.223 124.095C61.0547 124.095 64.7744 125.003 67.5952 126.874L68.0756 129.281C67.0815 130.368 66.4374 131.73 66.2274 133.19C65.937 134.843 66.0044 136.54 66.425 138.166C68.6607 147.005 66.0957 151.274 56.223 154.663Z'
                fill='#FFBC1F'
            />
            <path
                d='M56.223 154.663C46.3503 151.255 43.7736 147.008 46.021 138.166C46.4416 136.54 46.509 134.843 46.2186 133.19C46.0073 131.73 45.3618 130.368 44.3665 129.281L44.8469 126.874C47.6677 125.003 51.3913 124.095 56.223 124.095C61.0547 124.095 64.7744 125.003 67.5952 126.874L68.0756 129.281C67.0815 130.368 66.4374 131.73 66.2274 133.19C65.937 134.843 66.0044 136.54 66.425 138.166C68.6607 147.005 66.0957 151.274 56.223 154.663Z'
                fill='#FFBC1F'
            />
            <path
                d='M56.223 136.788V124.103C51.3913 124.103 47.6677 125.011 44.8469 126.882L44.3665 129.288C45.3618 130.375 46.0073 131.738 46.2186 133.197C46.4265 134.386 46.4487 135.6 46.2844 136.796L56.223 136.788Z'
                fill='#FFBC1F'
            />
            <path
                d='M56.223 154.663C66.0957 151.275 68.6607 147.005 66.425 138.166C66.3098 137.712 66.2205 137.252 66.1576 136.788H56.223V154.663Z'
                fill='#FFBC1F'
            />
            <path
                d='M46.0209 138.166C43.7736 147.009 46.3502 151.255 56.2229 154.663V136.788H46.2843C46.2228 137.252 46.1348 137.712 46.0209 138.166Z'
                fill='#FFD791'
            />
            <path
                d='M56.223 124.103V136.796H66.1576C65.9927 135.6 66.0162 134.386 66.2274 133.197C66.4374 131.738 67.0814 130.376 68.0756 129.288L67.5951 126.882C64.786 125.003 61.0508 124.103 56.223 124.103Z'
                fill='#FFD791'
            />
            <path
                d='M62.0311 132.801L54.0338 141.613L51.7128 139.85H50.4225L54.0338 145.723L63.3214 132.801H62.0311Z'
                fill='#66320A'
            />
        </g>
        <g clipPath='url(#clip1)'>
            <path
                d='M218.406 31.4287H136.605C132.284 31.4287 128.781 34.909 128.781 39.2021V52.0669C128.781 56.36 132.284 59.8403 136.605 59.8403H218.406C222.727 59.8403 226.23 56.36 226.23 52.0669V39.2021C226.23 34.909 222.727 31.4287 218.406 31.4287Z'
                fill='#1C58D9'
            />
            <path
                d='M226.23 52.4463C226.223 54.405 225.436 56.2814 224.042 57.6664C222.648 59.0515 220.759 59.833 218.788 59.8407H136.224C134.251 59.8355 132.361 59.0548 130.966 57.6692C129.572 56.2836 128.786 54.4058 128.781 52.4463C128.781 52.4463 131.715 56.1483 137.847 56.1386H217.066C220.485 56.1237 223.767 54.8014 226.23 52.4463Z'
                fill='#1E325C'
            />
            <path
                d='M144.723 50.3857C147.877 50.3857 150.434 47.8451 150.434 44.7112C150.434 41.5772 147.877 39.0366 144.723 39.0366C141.568 39.0366 139.011 41.5772 139.011 44.7112C139.011 47.8451 141.568 50.3857 144.723 50.3857Z'
                fill='#32A4EC'
            />
            <path
                d='M192.587 47.7429C194.272 47.7429 195.638 46.3856 195.638 44.7113C195.638 43.037 194.272 41.6797 192.587 41.6797C190.901 41.6797 189.535 43.037 189.535 44.7113C189.535 46.3856 190.901 47.7429 192.587 47.7429Z'
                fill='white'
            />
            <path
                d='M202.817 47.7429C204.502 47.7429 205.868 46.3856 205.868 44.7113C205.868 43.037 204.502 41.6797 202.817 41.6797C201.131 41.6797 199.765 43.037 199.765 44.7113C199.765 46.3856 201.131 47.7429 202.817 47.7429Z'
                fill='white'
            />
            <path
                d='M213.056 47.7429C214.742 47.7429 216.108 46.3856 216.108 44.7113C216.108 43.037 214.742 41.6797 213.056 41.6797C211.371 41.6797 210.005 43.037 210.005 44.7113C210.005 46.3856 211.371 47.7429 213.056 47.7429Z'
                fill='white'
            />
            <path
                d='M218.406 63.8145H136.605C132.284 63.8145 128.781 67.2947 128.781 71.5878V84.4527C128.781 88.7458 132.284 92.226 136.605 92.226H218.406C222.727 92.226 226.23 88.7458 226.23 84.4527V71.5878C226.23 67.2947 222.727 63.8145 218.406 63.8145Z'
                fill='#1C58D9'
            />
            <path
                d='M226.23 84.8315C226.223 86.7903 225.436 88.6666 224.042 90.0516C222.648 91.4367 220.759 92.2182 218.788 92.2259H136.224C134.251 92.2208 132.361 91.4401 130.966 90.0545C129.572 88.6689 128.786 86.7911 128.781 84.8315C128.781 84.8315 131.715 88.5336 137.847 88.5239C143.979 88.5141 213.262 88.5239 217.066 88.5239C220.485 88.5089 223.767 87.1867 226.23 84.8315Z'
                fill='#1E325C'
            />
            <path
                d='M144.723 82.7719C147.877 82.7719 150.434 80.2314 150.434 77.0974C150.434 73.9634 147.877 71.4229 144.723 71.4229C141.568 71.4229 139.011 73.9634 139.011 77.0974C139.011 80.2314 141.568 82.7719 144.723 82.7719Z'
                fill='#32A4EC'
            />
            <path
                d='M192.587 80.1286C194.272 80.1286 195.638 78.7713 195.638 77.097C195.638 75.4227 194.272 74.0654 192.587 74.0654C190.901 74.0654 189.535 75.4227 189.535 77.097C189.535 78.7713 190.901 80.1286 192.587 80.1286Z'
                fill='white'
            />
            <path
                d='M202.817 80.1286C204.502 80.1286 205.868 78.7713 205.868 77.097C205.868 75.4227 204.502 74.0654 202.817 74.0654C201.131 74.0654 199.765 75.4227 199.765 77.097C199.765 78.7713 201.131 80.1286 202.817 80.1286Z'
                fill='white'
            />
            <path
                d='M213.056 80.1286C214.742 80.1286 216.108 78.7713 216.108 77.097C216.108 75.4227 214.742 74.0654 213.056 74.0654C211.371 74.0654 210.005 75.4227 210.005 77.097C210.005 78.7713 211.371 80.1286 213.056 80.1286Z'
                fill='white'
            />
            <path
                d='M218.406 96.2002H136.605C132.284 96.2002 128.781 99.6804 128.781 103.974V116.838C128.781 121.132 132.284 124.612 136.605 124.612H218.406C222.727 124.612 226.23 121.132 226.23 116.838V103.974C226.23 99.6804 222.727 96.2002 218.406 96.2002Z'
                fill='#1C58D9'
            />
            <path
                d='M226.23 117.217C226.225 119.176 225.439 121.054 224.045 122.44C222.65 123.825 220.76 124.606 218.788 124.611H136.224C134.251 124.606 132.361 123.825 130.966 122.44C129.572 121.054 128.786 119.176 128.781 117.217C128.781 117.217 131.715 120.929 137.847 120.909H217.066C220.485 120.894 223.767 119.572 226.23 117.217Z'
                fill='#1E325C'
            />
            <path
                d='M144.723 115.157C147.877 115.157 150.434 112.617 150.434 109.483C150.434 106.349 147.877 103.808 144.723 103.808C141.568 103.808 139.011 106.349 139.011 109.483C139.011 112.617 141.568 115.157 144.723 115.157Z'
                fill='#32A4EC'
            />
            <path
                d='M192.587 112.514C194.272 112.514 195.638 111.157 195.638 109.483C195.638 107.808 194.272 106.451 192.587 106.451C190.901 106.451 189.535 107.808 189.535 109.483C189.535 111.157 190.901 112.514 192.587 112.514Z'
                fill='white'
            />
            <path
                d='M202.817 112.514C204.502 112.514 205.868 111.157 205.868 109.483C205.868 107.808 204.502 106.451 202.817 106.451C201.131 106.451 199.765 107.808 199.765 109.483C199.765 111.157 201.131 112.514 202.817 112.514Z'
                fill='white'
            />
            <path
                d='M213.056 112.514C214.742 112.514 216.108 111.157 216.108 109.483C216.108 107.808 214.742 106.451 213.056 106.451C211.371 106.451 210.005 107.808 210.005 109.483C210.005 111.157 211.371 112.514 213.056 112.514Z'
                fill='white'
            />
            <path
                d='M210.699 59.8403H144.321V63.8145H210.699V59.8403Z'
                fill='#1B1D22'
            />
            <path
                d='M210.699 92.2261H144.321V96.2002H210.699V92.2261Z'
                fill='#1B1D22'
            />
        </g>
        <defs>
            <clipPath id='clip0'>
                <rect
                    width='101.854'
                    height='74.9875'
                    fill='white'
                    transform='translate(4.35394 108.622)'
                />
            </clipPath>
            <clipPath id='clip1'>
                <rect
                    width='97.4494'
                    height='93.183'
                    fill='white'
                    transform='translate(128.781 31.4287)'
                />
            </clipPath>
        </defs>
    </svg>
);

export default LdapSVG;
