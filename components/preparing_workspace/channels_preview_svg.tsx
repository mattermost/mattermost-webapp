// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useLayoutEffect} from 'react';

type Props = {
    width?: number;
    height?: number;
    team: string;
    channel: string;
}

const MAX_WIDTH_TOP_CHANNEL_NAME = 428;
const MAX_WIDTH_SIDE_CHANNEL_NAME = 172;
const MAX_WIDTH_TEAM_NAME = 172;

function trimToWidth<T extends SVGElement | HTMLElement>(ref: React.MutableRefObject<T | null | undefined>, maxWidth: number, text: string): string {
    const rect = ref.current?.getBoundingClientRect?.();
    if (!rect || rect.width <= maxWidth) {
        return text;
    }
    const textLength = text.length;
    const percentToShortenBy = (maxWidth / rect.width);

    // i.e  back to 100% of allowed width, minus two characters because of exclusive end index,
    // because we want to avoid overflow and because
    return text.slice(0, Math.floor(textLength * percentToShortenBy) - 1) + '…';
}

export default (props: Props) => {
    const teamRef = useRef<SVGTextElement>(null);
    const topChannelRef = useRef<SVGTextElement>(null);
    const sideChannelRef = useRef<SVGTextElement>(null);

    useLayoutEffect(() => {
        if (topChannelRef.current) {
            const newText = trimToWidth(topChannelRef, MAX_WIDTH_TOP_CHANNEL_NAME, props.channel);
            topChannelRef.current.innerHTML = newText;
        }

        if (sideChannelRef.current) {
            const newText = trimToWidth(sideChannelRef, MAX_WIDTH_SIDE_CHANNEL_NAME, props.channel);
            sideChannelRef.current.innerHTML = newText;
        }
    }, [props.channel]);

    useLayoutEffect(() => {
        if (teamRef.current) {
            const newText = trimToWidth(teamRef, MAX_WIDTH_TEAM_NAME, props.team);
            teamRef.current.innerHTML = newText;
        }
    }, [props.team]);
    return (
        <svg
            width={732}
            height={499}
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <g filter='url(#channels-preview-group)'>
                <rect
                    x={32}
                    y={12}
                    width={668}
                    height={435}
                    rx={12}
                    fill='#fff'
                />
                <path
                    d='M32 41h240v406H44c-6.627 0-12-5.373-12-12V41Z'
                    fill='#1E325C'
                />
                <path
                    fill='#fff'
                    fillOpacity={0.16}
                    d='M32 177h240v32H32z'
                />
                <path
                    d='M32 177a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2v-32Z'
                    fill='#5D89EA'
                />
                <path
                    d='M62 185.494C60.644 185.494 59.384 185.836 58.22 186.52C57.092 187.192 56.192 188.092 55.52 189.22C54.836 190.384 54.494 191.644 54.494 193C54.494 194.356 54.836 195.616 55.52 196.78C56.192 197.908 57.092 198.808 58.22 199.48C59.384 200.164 60.644 200.506 62 200.506C63.356 200.506 64.616 200.164 65.78 199.48C66.908 198.808 67.808 197.908 68.48 196.78C69.164 195.616 69.506 194.356 69.506 193C69.506 191.644 69.164 190.384 68.48 189.22C67.808 188.092 66.908 187.192 65.78 186.52C64.616 185.836 63.356 185.494 62 185.494ZM67.994 193.378C67.862 193.558 67.556 193.756 67.076 193.972C66.476 194.236 65.786 194.434 65.006 194.566V192.028C66.074 191.836 66.896 191.608 67.472 191.344C67.496 191.32 67.544 191.296 67.616 191.272C67.7 191.248 67.754 191.224 67.778 191.2C67.922 191.716 67.994 192.316 67.994 193V193.378ZM60.884 196.294C61.004 196.294 61.184 196.306 61.424 196.33C61.676 196.354 61.868 196.366 62 196.366C62.504 196.366 62.882 196.342 63.134 196.294C62.954 197.014 62.756 197.614 62.54 198.094C62.348 198.526 62.168 198.802 62 198.922C61.82 198.79 61.634 198.514 61.442 198.094C61.202 197.59 61.016 196.99 60.884 196.294ZM62 194.872C61.352 194.872 60.878 194.848 60.578 194.8C60.578 194.632 60.566 194.368 60.542 194.008C60.518 193.576 60.506 193.24 60.506 193V192.172C60.854 192.22 61.352 192.244 62 192.244C62.648 192.244 63.146 192.22 63.494 192.172V193C63.494 193.24 63.482 193.576 63.458 194.008C63.434 194.368 63.422 194.632 63.422 194.8C63.122 194.848 62.648 194.872 62 194.872ZM63.35 190.678C63.05 190.726 62.6 190.75 62 190.75C61.4 190.75 60.95 190.726 60.65 190.678C60.794 189.718 61.01 188.878 61.298 188.158C61.538 187.558 61.772 187.174 62 187.006C62.228 187.174 62.462 187.558 62.702 188.158C62.99 188.878 63.206 189.718 63.35 190.678ZM67.094 189.85C66.71 190.006 66.392 190.126 66.14 190.21C65.708 190.354 65.276 190.456 64.844 190.516C64.772 189.94 64.664 189.376 64.52 188.824C64.376 188.272 64.214 187.786 64.034 187.366C65.342 187.834 66.362 188.662 67.094 189.85ZM56.906 189.85C57.29 189.262 57.74 188.764 58.256 188.356C58.796 187.912 59.396 187.582 60.056 187.366C59.672 188.206 59.372 189.256 59.156 190.516C58.232 190.312 57.482 190.09 56.906 189.85ZM56.294 191.2C56.33 191.224 56.384 191.254 56.456 191.29L56.6 191.344C57.248 191.632 58.076 191.86 59.084 192.028C59.048 192.16 59.024 192.31 59.012 192.478C59 192.586 58.994 192.76 58.994 193C58.994 193.696 59.024 194.218 59.084 194.566C58.304 194.434 57.614 194.236 57.014 193.972C56.522 193.756 56.21 193.558 56.078 193.378V193C56.042 192.7 56.042 192.388 56.078 192.064C56.114 191.74 56.186 191.452 56.294 191.2ZM56.528 195.394C57.464 195.766 58.388 196.018 59.3 196.15C59.42 196.954 59.672 197.776 60.056 198.616C59.264 198.352 58.562 197.938 57.95 197.374C57.338 196.81 56.864 196.15 56.528 195.394ZM67.472 195.394C67.136 196.15 66.662 196.81 66.05 197.374C65.438 197.938 64.736 198.352 63.944 198.616C64.328 197.776 64.58 196.954 64.7 196.15C65.888 195.982 66.812 195.73 67.472 195.394Z'
                    fill='white'
                />
                <text
                    fill='white'
                    x='81'
                    y='198'
                    style={{
                        fontSize: '14px',
                    }}
                    ref={sideChannelRef}
                >
                    {props.channel}
                </text>
                <path
                    d='M32 24c0-6.627 5.373-12 12-12h644c6.627 0 12 5.373 12 12v17H32V24Z'
                    fill='#14213E'
                />
                <text
                    fill='white'
                    x='49'
                    y='74'
                    style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        fontFamily: 'Metropolis, sans-serif',
                    }}
                    ref={teamRef}
                >
                    {props.team}
                </text>
                <circle
                    opacity={0.16}
                    cx={247}
                    cy={69}
                    r={10}
                    fill='#fff'
                />
                <rect
                    opacity={0.16}
                    x={48}
                    y={95}
                    width={209}
                    height={28}
                    rx={4}
                    fill='#fff'
                />
                <rect
                    opacity={0.16}
                    x={48}
                    y={154}
                    width={77}
                    height={9}
                    rx={4}
                    fill='#fff'
                />
                <text
                    fill='#3F4350'
                    x='292'
                    y='74'
                    style={{
                        fontSize: '14px',
                        fontFamily: 'Metropolis, sans-serif',
                    }}
                    ref={topChannelRef}
                >
                    {props.channel}
                </text>
                <path
                    stroke='#3F4350'
                    strokeOpacity={0.16}
                    d='M272 95.5h428'
                />
                <rect
                    x={288}
                    y={400}
                    width={396}
                    height={31}
                    rx={4}
                    fill='#fff'
                />
                <rect
                    x={289}
                    y={401}
                    width={394}
                    height={29}
                    rx={3}
                    stroke='#3F4350'
                    strokeOpacity={0.16}
                    strokeWidth={2}
                />
            </g>
            <defs>
                <filter
                    id='channels-preview-group'
                    x={0}
                    y={0}
                    width={732}
                    height={499}
                    filterUnits='userSpaceOnUse'
                    colorInterpolationFilters='sRGB'
                >
                    <feFlood
                        floodOpacity={0}
                        result='BackgroundImageFix'
                    />
                    <feColorMatrix
                        in='SourceAlpha'
                        values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
                        result='hardAlpha'
                    />
                    <feOffset dy={20}/>
                    <feGaussianBlur stdDeviation={16}/>
                    <feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0'/>
                    <feBlend
                        in2='BackgroundImageFix'
                        result='effect1_dropShadow_6_12990'
                    />
                    <feBlend
                        in='SourceGraphic'
                        in2='effect1_dropShadow_6_12990'
                        result='shape'
                    />
                </filter>
            </defs>
        </svg>
    );
};
