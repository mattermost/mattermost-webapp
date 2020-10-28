// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import PDFJS from 'pdfjs-dist';
import {getFileDownloadUrl} from 'mattermost-redux/utils/file_utils';

import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import FileInfoPreview from 'components/file_info_preview';

const MAX_PDF_PAGES = 5;

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

        this.state = {
            pdf: null,
            pdfPages: {},
            pdfPagesLoaded: {},
            numPages: 0,
            loading: true,
            success: false,
        };

        for (let i = 0; i < MAX_PDF_PAGES; i++) {
            this[`pdfCanvasRef-${i}`] = React.createRef();
        }
    }

    componentDidMount() {
        this.getPdfDocument();
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

        if (this.state.success) {
            for (let i = 0; i < this.state.numPages; i++) {
                this.renderPDFPage(i, prevProps);
            }
        }
    }

    downloadFile = (e) => {
        const fileDownloadUrl = this.props.fileInfo.link || getFileDownloadUrl(this.props.fileInfo.id);
        e.preventDefault();
        window.location.href = fileDownloadUrl;
    }

    renderPDFPage = (pageIndex, prevProps) => {
        if ((this.pdfPagesRendered[pageIndex] || !this.state.pdfPagesLoaded[pageIndex]) &&
            (prevProps.scale === this.props.scale)) {
            return;
        }

        const canvas = this[`pdfCanvasRef-${pageIndex}`].current;
        const context = canvas.getContext('2d');
        const viewport = this.state.pdfPages[pageIndex].getViewport(this.props.scale);

        this[`pdfCanvasRef-${pageIndex}`].current.height = viewport.height;
        this[`pdfCanvasRef-${pageIndex}`].current.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport,
        };

        this.state.pdfPages[pageIndex].render(renderContext);
        this.pdfPagesRendered[pageIndex] = true;
    }

    getPdfDocument = () => {
        PDFJS.getDocument(this.props.fileUrl).then(this.onDocumentLoad).catch(this.onDocumentLoadError);
    }

    onDocumentLoad = (pdf) => {
        const numPages = pdf.numPages <= MAX_PDF_PAGES ? pdf.numPages : MAX_PDF_PAGES;
        this.setState({pdf, numPages});
        for (let i = 1; i <= pdf.numPages; i++) {
            pdf.getPage(i).then(this.onPageLoad);
        }
    }

    onDocumentLoadError = (reason) => {
        console.log('Unable to load PDF preview: ' + reason); //eslint-disable-line no-console
        this.setState({loading: false, success: false});
    }

    onPageLoad = (page) => {
        const pdfPages = Object.assign({}, this.state.pdfPages);
        pdfPages[page.pageIndex] = page;

        const pdfPagesLoaded = Object.assign({}, this.state.pdfPagesLoaded);
        pdfPagesLoaded[page.pageIndex] = true;

        this.setState({pdfPages, pdfPagesLoaded});

        if (page.pageIndex === 0) {
            this.setState({success: true, loading: false});
        }
    }

    render() {
        if (this.state.loading) {
            return (
                <div className='view-image__loading'>
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

        if (this.state.pdf.numPages > MAX_PDF_PAGES) {
            pdfCanvases.push(
                <div
                    className='pdf-max-pages'
                    key='previewpdfmorepages'
                >
                    <button
                        className='btn btn-primary'
                        onClick={this.downloadFile}
                    >
                        {<i className='icon icon-download-outline pdf-download-btn-spacer'/> }
                        <FormattedMessage
                            id='pdf_preview.max_pages'
                            defaultMessage='Download to read more pages'
                        />
                    </button>
                </div>,
            );
        }

        return (
            <div className='post-code'>
                {pdfCanvases}
            </div>
        );
    }
}
