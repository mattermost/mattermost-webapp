// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import ExternalImage from 'components/external_image';
import SizeAwareImage from 'components/size_aware_image';
import ViewImageModal from 'components/view_image';

type Props = {
    imageMetadata: {
        height: number,
        width: number
        format?: string
    },
    link: string,
    post: any,
}

type State = {
    showModal: boolean;
};

export default class PostImage extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            showModal: false,
        };
    }

    showModal = (e: React.MouseEvent) => {
        e.preventDefault();

        this.setState({showModal: true});
    }

    hideModal = () => {
        this.setState({showModal: false});
    }

    render() {
        return (
            <div className='post__embed-container'>
                <ExternalImage
                    src={this.props.link}
                    imageMetadata={this.props.imageMetadata}
                >
                    {(safeLink: string) => (
                        <React.Fragment>
                            <SizeAwareImage
                                className='img-div attachment__image cursor--pointer'
                                src={safeLink}
                                dimensions={this.props.imageMetadata}
                                showLoader={true}
                                onClick={this.showModal}
                            />
                            <ViewImageModal
                                show={this.state.showModal}
                                onModalDismissed={this.hideModal}
                                post={this.props.post}
                                startIndex={0}
                                fileInfos={[{
                                    has_preview_image: false,
                                    link: safeLink,
                                    extension: this.props.imageMetadata.format,
                                }]}
                                canDownloadFiles={false}
                                enablePublicLink={false}
                            />
                        </React.Fragment>
                    )}
                </ExternalImage>
            </div>
        );
    }
}
