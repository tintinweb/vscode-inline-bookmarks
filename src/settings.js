'use strict';
/**
 * @author github.com/tintinweb
 *  
 *
 *
 * */
/** imports */
const vscode = require('vscode');

function extensionConfig() {
    return vscode.workspace.getConfiguration('inline-bookmarks');
}

module.exports = {
    extensionConfig: extensionConfig
};