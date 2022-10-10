'use strict';
/** 
 * @author github.com/tintinweb
 *  
 * 
 * 
 * */
/** imports */
const vscode = require('vscode');
const {Utils} = require('vscode-uri');
const ignore = require('ignore');
const path = require('path');


module.exports = class GitIgnore {

    constructor() {
        this.gitIgnoreFile = {};  // { ignore: GitIgnore instance, cache: {path => result}}
    }

    onDidChange(uri) {
        vscode.workspace.fs.readFile(uri)
            .then((data) => {
                this.gitIgnoreFile[Utils.dirname(uri)] = { 
                    ignore: ignore().add(new TextDecoder().decode(data)),
                    cache: {} // fullpath -> result
                };
            });
    }

    onDidDelete(uri) {
        delete this.gitIgnoreFile[Utils.dirname(uri)];
    }

    getActiveIgnorePatternsForFile(uri){
        /***
         * 
         *   target: 
         *      file:///folderA/folderB/x/y/z/kyc/ignoreMe.file
         *   gitignore:
         *      file:///folderA/folderB/        --> [patt, patt, patt, ...]  #1
         *      file:///folderA/folderB/x/y/z   --> [patt, patt, patt, ...]  #2
         * 
         * 
         */

        function isSubdir(parent, target){
            const relative = path.relative(parent, target);
            return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
        }

        if(!Object.keys(this.gitIgnoreFile).length){
            return [];
        }

        return Object.keys(this.gitIgnoreFile)
            .filter(gitIgnoreLocation => isSubdir(vscode.Uri.parse(gitIgnoreLocation).fsPath, uri.fsPath))
            .sort((a, b) => a.split('/').length - b.split('/').length);
    }

    ignores(uri){
        let gitIgnoreFiles = this.getActiveIgnorePatternsForFile(uri);
        if(!gitIgnoreFiles){
            return true;
        }

        let ignoreIt = gitIgnoreFiles.some(gitIgnoreLocation => {
            let ig = this.gitIgnoreFile[gitIgnoreLocation];
            if(ig.cache[uri.fsPath] !== undefined){
                return ig.cache[uri.fsPath]; // return cache result
            }
            let result = ig.ignore.ignores(path.relative(vscode.Uri.parse(gitIgnoreLocation).fsPath, uri.fsPath));
            ig.cache[uri.fsPath] = result;
            return result;
        })
        //console.log(`DEBUG: ignoreit: ${ignoreIt} (${uri.fsPath})`);
        return ignoreIt;

    }

    filter(uri){
        return !this.ignores(uri); // ignores.true ==> filter.false (exclude)
    }
}

