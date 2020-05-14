// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console,consistent-return */

const fs = require('fs');

const path = require('path');
const async = require('async');
const AWS = require('aws-sdk');
const mime = require('mime-types');
const readdir = require('recursive-readdir');

require('dotenv').config();

const {
    AWS_S3_BUCKET,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY
} = process.env;

const s3 = new AWS.S3({
    signatureVersion: 'v4',
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
});

function getFiles(dirPath) {
    return fs.existsSync(dirPath) ? readdir(dirPath) : [];
}

async function saveArtifacts(upload, bucketFolder) {
    if (!AWS_S3_BUCKET || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
        console.log('No AWS credentials found. Test artifacts not uploaded to S3.');

        return;
    }

    const uploadPath = path.resolve(__dirname, upload);
    const filesToUpload = await getFiles(uploadPath);

    return new Promise((resolve, reject) => {
        async.eachOfLimit(
            filesToUpload,
            10,
            async.asyncify(async (file) => {
                const Key = file.replace(uploadPath, bucketFolder);
                const contentType = mime.lookup(file);
                const charset = mime.charset(contentType);

                return new Promise((res, rej) => {
                    s3.upload(
                        {
                            Key,
                            Bucket: AWS_S3_BUCKET,
                            Body: fs.readFileSync(file),
                            ContentType: `${contentType}${charset ? '; charset=' + charset : ''}`
                        },
                        (err) => {
                            if (err) {
                                console.log('Failed to upload artifact:', file);
                                return rej(new Error(err));
                            }
                            res({success: true});
                        }
                    );
                });
            }),
            (err) => {
                if (err) {
                    console.log('Failed to upload artifacts');
                    return reject(new Error(err));
                }

                resolve({success: true});
            }
        );
    });
}

module.exports = {saveArtifacts};
