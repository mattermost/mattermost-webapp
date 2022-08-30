// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import _freezeframe from "freezeframe"
interface PostEmojiProps {
    name: string;
    imageUrl: string;
    autoplayGifAndEmojis: string;
}

type State = {
    options: {
        trigger: string
    }
}
declare module 'react' {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        alt?: string;
    }
}

export default class PostEmoji extends React.PureComponent<PostEmojiProps, State> {
    freeze: React.RefObject<any>;
    $freezeframe: _freezeframe | undefined;

    constructor(props: PostEmojiProps) {
        super(props)

        this.state = {
            options : {
                trigger: 'hover'
            }
        }
        this.freeze = React.createRef();
    }

    componentDidMount() {
        var _this2 = this;
  
        if (this.freeze.current === null) {
          throw new ReferenceError('You must provide a valid ref');
        }
  
        this.$freezeframe = new _freezeframe(this.freeze.current, this.state.options);
      }
    public render() {
        const emojiText = ':' + this.props.name + ':';

        if (!this.props.imageUrl) {
            return emojiText;
        }

        return (
           <div style={{width: '32px', height: '32px'}}>
             <img style={{marginTop: '-21px'}} onClick={() => this.$freezeframe?.start()} ref={this.freeze} alt={emojiText}
            className='emoticon'
            title={emojiText}
            src={this.props.imageUrl}
            />
           </div>
        );
    }
}
