// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Freezeframe from 'freezeframe';
import React from 'react';
import ReactFreezeframe from "react-freezeframe"
// interface PostEmojiProps {
//     name: string;
//     imageUrl: string;
// }
// declare module 'react' {
//     interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
//         alt?: string;
//     }
// }

export default class PostEmoji extends React.PureComponent{
    
    componentDidMount() {
        const ff = new Freezeframe()
        ff.destroy();
        console.log(ff.stop())
    }
     render() {
        const emojiText = ':' + this.props.name + ':';

        if (!this.props.imageUrl) {
            return emojiText;
        }
        console.log(this.props.imageUrl)
        console.log(this.props.autoplayGifAndEmojis)
        

        // if(this.props.autoplayGifAndEmojis !== 'true') {
        // }
       

        return (
            // this.props.autoplayGifAndEmojis === 'true' && this.props.imageUrl.endsWith('png') ? (
                <span
                alt={emojiText}
                className='emoticon'
                title={emojiText}
                style={{backgroundImage: 'url(' + this.props.imageUrl + ')'}}
            >
                {emojiText}
            </span> 
            // ) : this.props.imageUrl.endsWith('png') ? (
            //     <span
            //     alt={emojiText}
            //     className='emoticon'
            //     title={emojiText}
            //     style={{backgroundImage: 'url(' + this.props.imageUrl + ')'}}
            // >
            //     {emojiText}
            // </span> 
            // ) : (
            //     <div style={{width: '32px', height: '32px'}} id='hell'>
            //         <ReactFreezeframe options={{
            //     trigger: 'click'
            //     }}> 
            //             <span
            //     alt={emojiText}
            //     className='emoticon'
            //     title={emojiText}
                // style={{backgroundImage: 'url(' + this.props.imageUrl + ')'}}
            // >
            //             <img alt={emojiText}  src={this.props.imageUrl}/>
            // </span> 
            //          </ReactFreezeframe>
            //          </div>
            // )
        );
    }
}
