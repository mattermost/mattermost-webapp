// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useCallback, useEffect, useState} from 'react';
import classNames from 'classnames';

import './gif_player.scss';

const preload = (src: string, callback: (img: HTMLImageElement) => void) => {
    const img = new Image();
    if (typeof callback === 'function') {
        img.onload = () => callback(img);
        img.setAttribute('crossOrigin', 'anonymous');
    }
    img.src = src;
};

const firstGifFrameUrl = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    if (typeof canvas.getContext !== 'function') {
        return null;
    }
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0);
    return canvas.toDataURL();
};

type Props = {
    gif: string;
    still: string;
    playing: boolean;
    toggle: () => void;
    propogation?: boolean
    playButton?: boolean;
}

function GifPlayer({gif, still, playing, toggle, propogation, playButton}: Props) {
    return (
        <div
            className={classNames('gif_player', {playing})}
            onClick={propogation ? undefined : toggle}
        >
            <div className={playButton ?  'play_button' : ''}/>
            <img
                src={playing ? (gif || still) : (still || gif)}
            />
        </div>
    );
}

type GifCTRProps = {
    gif: string;
    still?: string;
    autoPlay: boolean;
    propogation?: boolean;
    playButton?: boolean;
}

function GifPlayerContainer(props: GifCTRProps) {
    const [playing, setPlaying] = useState(props.autoPlay);
    const [actualStill, setActualStill] = useState<string | null>(null);

    useEffect(() => {
        preload(props.gif, (img) => {
            console.log('props gif');
            const actualStill = firstGifFrameUrl(img);
            if (actualStill) {
                setActualStill(actualStill);
            }
        },
        );
    }, [props.gif, props.still]);

    const toggle = useCallback(() => {
        setPlaying(!playing);
    }, [playing]);

    return (
        <GifPlayer
            gif={props.gif}
            still={actualStill!}
            playing={playing}
            toggle={toggle}
            propogation={props.propogation}
            playButton={props.playButton}
        />
    );
}

export default GifPlayerContainer;