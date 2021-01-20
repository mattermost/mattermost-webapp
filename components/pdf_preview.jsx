// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import PDFJS from 'pdfjs-dist';
import {getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import FileInfoPreview from 'components/file_info_preview';

export default class PDFPreview extends React.PureComponent {
    static propTypes = {

        /**
        * Compare file types
        */
        fileInfo: PropTypes.object.isRequired,

        /**
        *  URL of pdf file to output and compare to update props url
        */
        fileUrl: PropTypes.string.isRequired,
        scale: PropTypes.number.isRequired,
    }

    constructor(props) {
        super(props);

        this.pdfPagesRendered = {};
        this.container = React.createRef();

        this.state = {
            pdf: null,
            pdfPages: {},
            pdfPagesLoaded: {},
            numPages: 0,
            loading: true,
            success: false,
        };
    }

    componentDidMount() {
        this.getPdfDocument();
        if (this.container.current) {
            this.parentNode = this.container.current.parentElement.parentElement;
        }
    }

    componentWillUnmount() {
        if (this.parentNode) {
            this.parentNode.removeEventListener('scroll', this.handleScroll);
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (props.fileUrl !== state.prevFileUrl) {
            return {
                pdf: null,
                pdfPages: {},
                pdfPagesLoaded: {},
                numPages: 0,
                loading: true,
                success: false,
                prevFileUrl: props.fileUrl,
            };
        }
        return null;
    }

    componentDidUpdate(prevProps) {
        if (this.props.fileUrl !== prevProps.fileUrl) {
            this.getPdfDocument();
            this.pdfPagesRendered = {};
        }
        if (this.props.scale !== prevProps.scale) {
            this.pdfPagesRendered = {};
        }

        if (this.state.success) {
            for (let i = 0; i < this.state.numPages; i++) {
                this.renderPDFPage(i);
            }
        }
    }

    downloadFile = (e) => {
        const fileDownloadUrl = this.props.fileInfo.link || getFileDownloadUrl(this.props.fileInfo.id);
        e.preventDefault();
        window.location.href = fileDownloadUrl;
    }

    isInViewport = (page) => {
        const bounding = page.getBoundingClientRect();
        const viewportTop = this.container.current.scrollTop;
        const viewportBottom = viewportTop + this.container.current.parentElement.clientHeight;
        return (
            (bounding.top >= viewportTop && bounding.top <= viewportBottom) ||
            (bounding.bottom >= viewportTop && bounding.bottom <= viewportBottom) ||
            (bounding.top <= viewportTop && bounding.bottom >= viewportBottom)
        );
    };

    renderPDFPage = async (pageIndex) => {
        const canvas = this[`pdfCanvasRef-${pageIndex}`].current;

        // Always render the first 3 pages to avoid problems detecting
        // isInViewport during the open animation
        if (pageIndex > 3 && !this.isInViewport(canvas)) {
            return;
        }

        if (this.pdfPagesRendered[pageIndex] || !this.state.pdfPagesLoaded[pageIndex]) {
            return;
        }

        const page = this.state.pdfPages[pageIndex];
        const context = canvas.getContext('2d');
        const viewport = page.getViewport(this.props.scale);

        this[`pdfCanvasRef-${pageIndex}`].current.height = viewport.height;
        this[`pdfCanvasRef-${pageIndex}`].current.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport,
        };

        page.render(renderContext);
        this.pdfPagesRendered[pageIndex] = true;
    }

    getPdfDocument = () => {
        PDFJS.getDocument(this.props.fileUrl).then(this.onDocumentLoad).catch(this.onDocumentLoadError);
    }

    onDocumentLoad = (pdf) => {
        this.setState({pdf, numPages: pdf.numPages});
        for (let i = 0; i < pdf.numPages; i++) {
            this[`pdfCanvasRef-${i}`] = React.createRef();
        }
        this.loadPages(pdf);
    }

    onDocumentLoadError = (reason) => {
        console.log('Unable to load PDF preview: ' + reason); //eslint-disable-line no-console
        this.setState({loading: false, success: false});
    }

    loadPages = async (pdf) => {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        for (let i = 0; i < pdf.numPages; i++) {
            await this.loadPage(pdf, i); // eslint-disable-line no-await-in-loop

            // Give time to render the interface
            await sleep(10); // eslint-disable-line no-await-in-loop
        }
    }

    loadPage = async (pdf, pageIndex) => {
        if (this.state.pdfPagesLoaded[pageIndex]) {
            return this.state.pdfPages[pageIndex];
        }

        const page = await pdf.getPage(pageIndex + 1);

        const pdfPages = Object.assign({}, this.state.pdfPages);
        pdfPages[page.pageIndex] = page;

        const pdfPagesLoaded = Object.assign({}, this.state.pdfPagesLoaded);
        pdfPagesLoaded[page.pageIndex] = true;

        this.setState({pdfPages, pdfPagesLoaded});

        if (page.pageIndex === 0) {
            this.setState({success: true, loading: false});
        }
        return page;
    }

    handleScroll = () => {
        if (this.state.success) {
            for (let i = 0; i < this.state.numPages; i++) {
                this.renderPDFPage(i);
            }
        }
    }

    render() {
        if (this.state.loading) {
            return (
                <div
                    ref={this.container}
                    className='view-image__loading'
                >
                    <LoadingSpinner/>
                </div>
            );
        }

        if (!this.state.success) {
            return (
                <FileInfoPreview
                    fileInfo={this.props.fileInfo}
                    fileUrl={this.props.fileUrl}
                />
            );
        }

        const pdfCanvases = [];
        for (let i = 0; i < this.state.numPages; i++) {
            pdfCanvases.push(
                <canvas
                    ref={this[`pdfCanvasRef-${i}`]}
                    key={'previewpdfcanvas' + i}
                />,
            );

            if (i < this.state.numPages - 1 && this.state.numPages > 1) {
                pdfCanvases.push(
                    <div
                        key={'previewpdfspacer' + i}
                        className='pdf-preview-spacer'
                    />,
                );
            }
        }

        return (
            <div
                ref={this.container}
                className='post-code'
            >
                {pdfCanvases}
            </div>
        );
    }
}
