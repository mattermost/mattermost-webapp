// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const fs = require('fs')

module.exports = async ({files, platform}) => {
    //remove the certs from the config folder
    files.forEach((file) => {
      console.log(file);
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
        } catch (err) {
          if (err.code !== 'ENOENT') {
            console.error(err);
          }
        }
      }
    });
    return null;
};