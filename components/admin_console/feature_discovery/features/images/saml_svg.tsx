// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

type SvgProps = {
    width?: number;
    height?: number;
}

const SamlSVG = (props: SvgProps) => (
    <svg
        width={props.width ? props.width.toString() : '242'}
        height={props.height ? props.height.toString() : '230'}
        viewBox='0 0 242 230'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
    >
        <path
            d='M241.521 59.137C241.521 53.3935 235.803 47.6499 230.086 47.6499H81.4347C75.7174 47.6499 70 53.3935 70 59.137V168.33H241.521V59.137Z'
            fill='#2D3039'
        />
        <path
            d='M70 168.33V179.817C70 185.561 75.7174 191.304 81.4347 191.304H230.086C235.803 191.304 241.521 185.561 241.521 179.817V168.33H70Z'
            fill='#DDDFE4'
        />
        <path
            d='M132.891 197.026C132.891 208.513 121.456 208.513 110.065 208.513H201.543C190.108 208.513 178.717 208.513 178.717 197.026V191.26H132.978L132.891 197.026Z'
            fill='#C6C9D2'
        />
        <path
            d='M230.086 59.1807H81.4348V156.821H230.086V59.1807Z'
            fill='white'
        />
        <rect
            width='149.764'
            height='98.341'
            transform='translate(80.6252 58.8018)'
            fill='#1E325C'
        />
        <path
            d='M155.76 176.749C156.326 176.749 156.878 176.917 157.348 177.233C157.819 177.548 158.185 177.997 158.401 178.521C158.618 179.046 158.674 179.623 158.564 180.181C158.454 180.738 158.181 181.249 157.782 181.651C157.382 182.053 156.872 182.326 156.318 182.437C155.763 182.548 155.189 182.491 154.666 182.274C154.144 182.056 153.697 181.688 153.383 181.216C153.069 180.744 152.902 180.188 152.902 179.62C152.902 178.859 153.203 178.128 153.739 177.59C154.275 177.051 155.002 176.749 155.76 176.749Z'
            fill='#BABEC9'
        />
        <path
            d='M201.499 208.513H110.021V220H201.499V208.513Z'
            fill='#A4A9B7'
        />
        <g clipPath='url(#clip0)'>
            <path
                d='M186.535 108.628C188.116 110.255 189 112.429 189 114.691C189 116.953 188.116 119.126 186.535 120.754C184.901 122.338 182.716 123.237 180.433 123.266H135.158C133.676 123.266 132.208 122.976 130.838 122.412C129.469 121.848 128.225 121.021 127.177 119.979C125.141 117.834 124.006 114.997 124.006 112.048C124.006 109.099 125.141 106.262 127.177 104.118C128.225 103.075 129.469 102.248 130.838 101.684C132.208 101.12 133.676 100.83 135.158 100.83C135.239 96.6198 136.692 93.1155 139.517 90.3171C142.342 87.5188 145.867 86.0748 150.093 85.9849C153.455 85.923 156.734 87.022 159.372 89.0945C161.974 91.1006 163.824 93.9157 164.626 97.0899C166.105 96.0531 167.878 95.5104 169.687 95.5399C172.051 95.5735 174.309 96.5222 175.98 98.1842C177.651 99.8463 178.604 102.091 178.637 104.44C178.64 105.091 178.553 105.738 178.38 106.366C179.057 106.194 179.754 106.107 180.453 106.106C182.73 106.142 184.907 107.045 186.535 108.628Z'
                fill='#FFBC1F'
            />
            <path
                d='M189.001 114.694C189.036 113.568 188.834 112.448 188.41 111.403C187.986 110.359 187.347 109.414 186.536 108.629C184.901 107.045 182.717 106.145 180.434 106.116C179.735 106.117 179.038 106.204 178.361 106.376C178.534 105.749 178.621 105.101 178.618 104.45C178.585 102.101 177.632 99.8563 175.961 98.1943C174.289 96.5323 172.032 95.5836 169.668 95.55C167.859 95.5205 166.086 96.0632 164.607 97.1C163.812 93.9249 161.969 91.1065 159.372 89.0949C156.734 87.0286 153.457 85.9349 150.098 85.9998C145.856 86.0864 142.331 87.5305 139.522 90.332C136.713 93.1336 135.26 96.6379 135.163 100.845C133.681 100.845 132.213 101.135 130.844 101.699C129.474 102.263 128.23 103.09 127.182 104.133C126.141 105.168 125.323 106.404 124.779 107.765C124.235 109.126 123.977 110.583 124.02 112.046C124.02 112.046 124.156 103.921 135.909 101.938C136.35 90.799 146.127 87.7423 150.195 87.7423C154.263 87.7423 160.922 89.7063 164.327 98.5537C171.508 94.077 179.528 99.5164 177.329 107.728C187.31 105.557 189.001 114.694 189.001 114.694Z'
                fill='#CC8F00'
            />
            <path
                d='M139.729 116.716V131.036C139.729 131.294 139.779 131.548 139.877 131.786C139.976 132.024 140.121 132.241 140.303 132.423C140.486 132.605 140.703 132.75 140.942 132.849C141.18 132.948 141.437 133 141.695 133H165.27C165.529 133 165.785 132.948 166.024 132.849C166.263 132.75 166.48 132.605 166.662 132.423C166.845 132.241 166.99 132.024 167.088 131.786C167.187 131.548 167.237 131.294 167.236 131.036V116.716H139.729Z'
                fill='#AABBC1'
            />
            <path
                d='M167.236 114.742C167.236 114.223 167.029 113.726 166.661 113.358C166.292 112.991 165.792 112.784 165.27 112.783H141.695C141.174 112.784 140.673 112.991 140.305 113.358C139.936 113.726 139.729 114.223 139.729 114.742V116.706H167.236V114.742Z'
                fill='#808F95'
            />
            <path
                d='M144.48 113.418C145.982 113.418 147.197 113.929 147.197 114.559C147.197 115.19 145.982 115.7 144.48 115.7C142.979 115.7 141.768 115.19 141.768 114.559C141.768 113.929 142.984 113.418 144.48 113.418Z'
                fill='#1B1D22'
            />
            <path
                d='M162.481 113.418C163.982 113.418 165.198 113.929 165.198 114.559C165.198 115.19 163.982 115.7 162.481 115.7C160.979 115.7 159.769 115.19 159.769 114.559C159.769 113.929 160.984 113.418 162.481 113.418Z'
                fill='#1B1D22'
            />
            <path
                d='M153.483 103.839C150.63 103.85 147.898 104.984 145.885 106.993C143.873 109.003 142.744 111.724 142.746 114.559C142.746 114.915 143.473 115.204 144.48 115.204V114.559C144.843 109.558 148.718 105.596 153.483 105.596C158.248 105.596 162.137 109.548 162.481 114.55V115.224C163.493 115.224 164.219 114.935 164.219 114.579C164.227 111.74 163.1 109.014 161.087 107C159.074 104.986 156.339 103.85 153.483 103.839Z'
                fill='#E0E9EF'
            />
            <path
                d='M162.481 114.559C162.137 109.558 158.234 105.606 153.483 105.606C148.732 105.606 144.829 109.558 144.48 114.559V115.224C145.492 115.224 146.417 114.935 146.417 114.579C146.417 111.344 149.124 107.503 153.502 107.503C157.88 107.503 160.587 111.353 160.587 114.579C160.587 114.935 161.493 115.224 162.5 115.224L162.481 114.559Z'
                fill='#AFBDC6'
            />
            <path
                d='M155.594 129.534L154.718 123.95C155.074 123.692 155.339 123.327 155.474 122.91C155.609 122.492 155.608 122.043 155.471 121.626C155.334 121.209 155.068 120.846 154.711 120.589C154.354 120.331 153.924 120.192 153.483 120.192C153.042 120.192 152.612 120.331 152.254 120.589C151.897 120.846 151.631 121.209 151.494 121.626C151.357 122.043 151.356 122.492 151.492 122.91C151.627 123.327 151.892 123.692 152.248 123.95L151.371 129.534H155.594Z'
                fill='#1B1D22'
            />
        </g>
        <mask
            id='mask0'
            mask-type='alpha'
            maskUnits='userSpaceOnUse'
            x='0'
            y='104'
            width='126'
            height='126'
        >
            <path
                d='M63 230C97.7939 230 126 201.794 126 167C126 132.206 97.7939 104 63 104C28.2061 104 0 132.206 0 167C0 201.794 28.2061 230 63 230Z'
                fill='#E8E9ED'
            />
        </mask>
        <g mask='url(#mask0)'>
            <path
                d='M68.6613 238.962C55.8358 244.057 16.6132 235.519 -4.79373 230.207C-7.31801 229.571 -9.5916 228.999 -11.5504 228.492C-16.29 227.272 -19.1758 226.46 -19.1758 226.46C-19.1758 226.46 -15.6779 220.904 -5.18435 193.695C-3.3538 188.95 -1.3192 183.551 0.94858 177.406C3.21636 171.26 5.12857 165.89 6.82503 161.326C7.40801 159.756 7.99099 158.268 8.50984 156.873C15.4531 138.99 19.5864 135.453 36.6851 137.887L37.0815 137.946C40.2587 138.424 43.8848 139.078 48.0589 139.901C53.1308 140.875 57.643 141.529 61.5665 142.171C62.2194 142.265 62.8433 142.375 63.4554 142.48C64.1666 142.597 64.8428 142.72 65.5191 142.848C66.102 142.965 66.685 143.076 67.268 143.204C80.0177 145.883 84.1335 150.792 78.8342 176.081C78.7351 176.495 78.6535 176.933 78.5719 177.341C71.2964 212.039 68.6613 238.962 68.6613 238.962Z'
                fill='#B7BAE1'
            />
        </g>
        <path
            d='M39.5241 144.92C39.5241 144.92 38.4048 133.569 40.69 123.863C42.439 116.316 47.2485 109.89 49.7845 109.779C55.5676 109.523 59.561 106.54 62.0911 109.453C64.184 112.114 66.3002 127.014 63.0181 129.635C61.7544 130.485 60.3992 131.19 58.978 131.736L58.5466 144.903L39.5241 144.92Z'
            fill='#CB8E00'
        />
        <path
            d='M63.0822 114.536C65.5598 118.242 67.163 120.956 67.163 120.956C67.2096 122.404 62.3359 122.655 62.3359 122.655L63.0822 114.536Z'
            fill='#CB8E00'
        />
        <path
            d='M55.0955 131.339C57.1019 131.6 59.1416 131.382 61.0478 130.703C61.7707 130.441 59.6544 131.684 58.9257 131.946C56.7979 132.705 57.2409 132.816 54.9906 132.53C54.2386 132.448 54.326 131.246 55.0955 131.339Z'
            fill='#332660'
        />
        <path
            d='M39.8449 103.937C38.3 104.393 37.2506 105.834 36.6093 107.305C35.9681 108.776 35.5891 110.375 34.7729 111.764C33.846 113.34 32.3769 114.577 31.6482 116.252C30.9195 117.927 31.38 120.39 33.1581 120.81C34.3707 121.091 35.659 120.291 36.86 120.629C38.6089 121.137 38.8596 123.548 38.4165 125.357C37.9735 127.166 37.2506 129.174 38.3232 130.686C39.4892 132.401 42.3691 132.086 43.745 130.511C45.1208 128.935 45.3015 126.658 45.08 124.587C44.8585 122.515 44.2871 120.454 44.4154 118.371C44.4795 117.203 44.9983 115.849 46.1293 115.663C47.2603 115.476 48.1581 116.596 48.3388 117.694C48.5195 118.791 48.2048 119.9 48.1523 121.015C48.0998 122.129 48.403 123.396 49.3882 123.933C50.9331 124.744 52.7461 122.935 52.8161 121.184C52.8861 119.433 51.9474 117.834 51.446 116.159C50.9447 114.484 51.0671 112.307 52.612 111.455C53.5739 110.912 54.769 111.099 55.8475 111.326C56.9261 111.554 58.0978 111.846 59.1122 111.402C68.2649 107.392 71.6754 103.459 66.2187 98.9939C62.6742 96.0757 51.0613 93.3735 47.8024 97.6574C46.4616 99.4083 47.5518 102.28 45.3889 103.494C43.7449 104.393 41.5821 103.43 39.8449 103.937Z'
            fill='#1A0C00'
        />
        <path
            d='M65.659 143.169C85.9408 146.56 97.4954 146.309 109.382 138.979C121.269 131.648 126.388 110.13 128.44 98.9179C130.492 87.7061 144.967 85.9027 140.099 90.3559C135.231 94.8091 137.027 93.4842 135.074 101.684C133.121 109.884 137.639 146.385 118.803 161.169C99.6816 176.174 74.1764 181.707 57.2467 179.507C40.3171 177.307 65.659 143.169 65.659 143.169Z'
            fill='#CB8E00'
        />
        <path
            d='M96.4403 175.947C94.6156 176.659 92.8025 177.26 90.972 177.779C89.8876 178.095 88.8014 178.377 87.7132 178.626C79.8486 180.351 71.7691 180.88 63.747 180.196C61.4792 180.038 59.3105 179.805 57.2526 179.53C44.8352 177.914 55.1772 159.103 61.5608 149.181C63.8927 145.586 65.6417 143.175 65.6417 143.175C66.3529 143.298 67.0699 143.415 67.7812 143.52C68.6498 143.66 69.5301 143.794 70.3579 143.911C75.7305 144.783 81.1629 145.233 86.6055 145.259C87.7073 145.259 88.7858 145.218 89.841 145.148C90.6222 145.09 91.4033 145.025 92.1729 144.938C93.9101 154.346 96.3995 175.807 96.4403 175.947Z'
            fill='#B7BAE1'
        />
        <path
            d='M63.403 142.487C62.7582 143.465 61.9187 144.3 60.937 144.938C57.3342 147.273 53.4691 148.814 49.1259 148.16C44.8819 147.518 41.3024 145.107 38.4517 141.967C37.3929 140.856 36.7486 139.413 36.627 137.882C37.4956 138.004 38.3759 138.145 39.332 138.296C41.2616 137.374 46.2169 137.853 49.4116 138.477C53.2592 139.224 56.9903 138.997 58.5585 141.687C60.2666 142.002 61.8815 142.224 63.403 142.487Z'
            fill='#CB8E00'
        />
        <defs>
            <clipPath id='clip0'>
                <rect
                    width='65'
                    height='47'
                    fill='white'
                    transform='translate(123 86)'
                />
            </clipPath>
        </defs>
    </svg>
);

export default SamlSVG;
