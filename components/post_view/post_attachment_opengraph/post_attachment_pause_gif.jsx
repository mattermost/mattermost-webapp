import React, { useState, useRef } from "react"
import GifPlayer from 'react-gif-player';


const GIFPlayer = (props) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const pauseGif = useRef(null);


    return (
        <GifPlayer  gif={props.src}
        pauseRef={(pause) => {
            pauseGif.current = pause;
        }}
        onTogglePlay={(isPlaying) => setIsPlaying(isPlaying)}
        autoplay={false} />
    )
}

export default GIFPlayer;