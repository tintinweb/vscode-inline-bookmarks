'use strict';
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * 
 * */
/** imports */
const vscode = require('vscode');
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const settings = require('../settings');

class Commands {
    constructor(controller){
        this.controller = controller;
    }

    refresh() {
        Object.keys(this.controller.bookmarks).forEach(uri => {
            vscode.workspace.openTextDocument(vscode.Uri.parse(uri)).then(document => {
                this.controller.updateBookmarks(document);
            });
        }, this);
    }
}

class InlineBookmarksCtrl {

    constructor(context) {
        this.context = context;
        this.styles = this._reLoadDecorations();
        this.words = this._reLoadWords();

        this.commands = new Commands(this);

        this.bookmarks = {};  // {file: {bookmark}}
        this.loadFromWorkspace();
    }

    /** -- public -- */

    hasBookmarks(){
        return !!this.bookmarks;
    }

    async decorate(editor){
        if (!editor || !editor.document || editor.document.fileName.startsWith("extension-output-") || this._extensionIsBlacklisted(editor.document.fileName)) return;
        
        this._clearBookmarksOfFile(editor.document);

        for (var style in this.words) {
            if (!this.words.hasOwnProperty(style) || this.words[style].length == 0 || this._wordIsOnIgnoreList(this.words[style])) {           
                continue;
            }
            this._decorateWords(editor, this.words[style], style);
        }

        this.saveToWorkspace(); //update workspace
    }

    async updateBookmarks(document){
        if (!document || document.fileName.startsWith("extension-output-") || this._extensionIsBlacklisted(document.fileName)) return;

        this._clearBookmarksOfFile(document);

        for (var style in this.words) {
            if (!this.words.hasOwnProperty(style) || this.words[style].length == 0 || this._wordIsOnIgnoreList(this.words[style])) {           
                continue;
            }
            this._updateBookmarksForWordAndStyle(document, this.words[style], style);
        }

        this.saveToWorkspace(); //update workspace
    }

    /** -- private -- */

    _extensionIsBlacklisted(fileName){
        let ignoreList = settings.extensionConfig().exceptions.file.extensions.ignore;
        if(!ignoreList || ignoreList.length === 0) return false;
        return this._commaSeparatedStringToUniqueList(ignoreList).some(ext => fileName.endsWith(ext.trim()));
    }

    _wordIsOnIgnoreList(word){
        let ignoreList = settings.extensionConfig().exceptions.words.ignore;
        return this._commaSeparatedStringToUniqueList(ignoreList).some(ignoreWord => word.startsWith(ignoreWord.trim()));      
    }

    _commaSeparatedStringToUniqueList(s){
        if(!s) return [];
        return [...new Set(s.trim().split(',').map(e => e.trim()).filter(e => e.length))];
    }

    async _decorateWords(editor, words, style){
        const decoStyle = this.styles[style] || this.styles['default'];

        let locations = this._findWords(editor.document, words);
        editor.setDecorations(decoStyle, locations);  // set decorations

        if(locations.length)
            this._addBookmark(editor.document, style, locations);
    }

    async _updateBookmarksForWordAndStyle(document, words, style){

        let locations = this._findWords(document, words);

        if(locations.length)
            this._addBookmark(document, style, locations);
    }

    _findWords(document, words){
        const text = document.getText();
        var locations = [];

        words.forEach(function(word){

            var regEx = new RegExp( word ,"g");
            let match;
            while (match = regEx.exec(text)) {
                
                var startPos = document.positionAt(match.index);
                var endPos = document.positionAt(match.index + match[0].trim().length);

                var fullLine = document.getWordRangeAtPosition(startPos, /(.+)$/);

                var decoration = { 
                    range: new vscode.Range(startPos, endPos), 
                    text: document.getText(new vscode.Range(startPos, fullLine.end))
                };

                locations.push(decoration);
            }
        });

        return locations;
    }

    _clearBookmarksOfFile(document) {
        let filename = document.uri;
        if(!this.bookmarks.hasOwnProperty(filename)) return;
        delete this.bookmarks[filename];
    }

    _clearBookmarksOfFileAndStyle(document, style){
        let filename = document.uri;
        if(!this.bookmarks.hasOwnProperty(filename)) return;
        delete this.bookmarks[filename][style];
    }

    _addBookmark(document, style, locations){
        let filename = document.uri;
        if(!this.bookmarks.hasOwnProperty(filename)){
            this.bookmarks[filename] = {};
        }
        this.bookmarks[filename][style] = locations;
    }

    _reLoadWords(){
        let defaultWords = {  // style: arr(regexWords)
            "blue": this._commaSeparatedStringToUniqueList(settings.extensionConfig().default.words.blue),
            "purple": this._commaSeparatedStringToUniqueList(settings.extensionConfig().default.words.purple),
            "green": this._commaSeparatedStringToUniqueList(settings.extensionConfig().default.words.green),
            "red": this._commaSeparatedStringToUniqueList(settings.extensionConfig().default.words.red)
        };

        return {...defaultWords, ...settings.extensionConfig().expert.custom.words.mapping};
    }

    _reLoadDecorations() {
        let styles = {
            "default": vscode.window.createTextEditorDecorationType({
                "gutterIconPath": this.context.asAbsolutePath(path.join("images","bookmark-blue.svg")),
                "overviewRulerColor": "rgba(21, 126, 251, 0.7)",
                "light": {
                    "fontWeight": "bold"
                },
                "dark": {
                    "color": "Chocolate"
                }
            }),
            "red": vscode.window.createTextEditorDecorationType({
                "gutterIconPath": this.context.asAbsolutePath(path.join("images","bookmark-red.svg")),
                "light": {
                    "fontWeight": "bold"
                },
                "dark": {
                    "color": "Chocolate"
                }
            }),
            "blue": vscode.window.createTextEditorDecorationType({
                "gutterIconPath": this.context.asAbsolutePath(path.join("images","bookmark-blue.svg")),
                "light": {
                    "fontWeight": "bold"
                },
                "dark": {
                    "color": "Chocolate"
                }
            }),
            "green": vscode.window.createTextEditorDecorationType({
                "gutterIconPath": this.context.asAbsolutePath(path.join("images","bookmark-green.svg")),
                "light": {
                    "fontWeight": "bold"
                },
                "dark": {
                    "color": "Chocolate"
                }
            }),
            "purple": vscode.window.createTextEditorDecorationType({
                "gutterIconPath": this.context.asAbsolutePath(path.join("images","bookmark-purple.svg")),
                "light": {
                    "fontWeight": "bold"
                },
                "dark": {
                    "color": "Chocolate"
                }
            })
        };

        let customStyles = settings.extensionConfig().expert.custom.styles;

        for (var decoId in customStyles) {

            if (!customStyles.hasOwnProperty(decoId)) {           
                continue;
            }

            let decoOptions = { ...customStyles[decoId]};
        
            //fix path
            decoOptions.gutterIconPath = this.context.asAbsolutePath(decoOptions.gutterIconPath);
            //overview
            if(decoOptions.overviewRulerColor){
                decoOptions.overviewRulerLane = vscode.OverviewRulerLane.Full;
            }
            //background color
            if (decoOptions.backgroundColor) {
                decoOptions.isWholeLine = true;
            }
            styles[decoId] = vscode.window.createTextEditorDecorationType(decoOptions);
        }

        return styles;
    }

    _isWorkspaceAvailable() {
        //single or multi root
        return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length >= 1;
    }

    saveToWorkspace(){
        if(!this._isWorkspaceAvailable()) return; //cannot save
        this.context.workspaceState.update("bookmarks.object", JSON.stringify(this.bookmarks));
    }

    loadFromWorkspace(){
        if(!this._isWorkspaceAvailable()) return; //cannot load
        this.bookmarks = JSON.parse(this.context.workspaceState.get("bookmarks.object", "{}"));

        //remove all non existing files
        Object.keys(this.bookmarks).forEach(filepath => {
            if (!fs.existsSync(vscode.Uri.parse(filepath).fsPath)) {
                delete this.bookmarks[filepath];
                return;
            }
            
            Object.keys(this.bookmarks[filepath]).forEach(cat => {
                //for each category
                this.bookmarks[filepath][cat] = this.bookmarks[filepath][cat].map(decoObject => {
                    //fix - rebuild range object (it is expected by other functions)
                    decoObject.range = new vscode.Range(decoObject.range[0].line, decoObject.range[0].character, decoObject.range[1].line, decoObject.range[1].character);
                    return decoObject;
                });
            });
        });
    }
}

const NodeType = {
    FILE : 1,
    LOCATION: 2
};


class InlineBookmarksDataModel {

    /** treedata model */

    constructor(controller){
        this.controller = controller;
    }

    getRoot(){  /** returns element */
        let fileBookmarks = Object.keys(this.controller.bookmarks);

        if(settings.extensionConfig().view.showVisibleFilesOnly){
            let visibleEditorUris = vscode.window.visibleTextEditors.map(te => te._documentData._uri.path);
            fileBookmarks = fileBookmarks.filter(v => visibleEditorUris.includes(vscode.Uri.parse(v).path));
        }

        return fileBookmarks.sort().map(v => {
            return { 
                resource: vscode.Uri.parse(v), 
                tooltip: v,
                name:v, 
                type: NodeType.FILE, 
                parent: null,
                iconPath: vscode.ThemeIcon.File,
                location: null
            };
        });
    }

    getChildren(element){
        switch(element.type){
            case NodeType.FILE:
                let bookmarks = Object.keys(this.controller.bookmarks[element.name]).map(cat => {
                    //all categories
                    return this.controller.bookmarks[element.name][cat].map(v => { 
                        let location = new vscode.Location(element.resource, v.range);
                        return { 
                            resource: element.resource,
                            location: location,
                            label: v.text.trim(),
                            name: v.text.trim(), 
                            type: NodeType.LOCATION, 
                            category: cat,
                            parent:element,
                            iconPath: vscode.Uri.file(this.controller.context.asAbsolutePath(path.join("images",`bookmark-${cat}.svg`)))
                        };
                    });
                }).flat(1);

                return bookmarks.sort((a,b) => a.location.range.start.line - b.location.range.start.line);
            break;
        }
    }

    /**
    Find previous and next of element (for goto_next, goto_previous)

    requires current element from tree
    */
    getNeighbors(element){
        let ret = {previous:null, next:null};
        let parent = element.parent;
        if(!parent){
            //fake the parent
            parent = { ...element };  //use parent or derive it from bookmark
            parent.type = NodeType.FILE;
            parent.name = element.resource;
        }

        //get all children
        let bookmarks = this.getChildren(parent);
        
        //lets track if we're at our element.
        let gotElement = false;

        for(let b of bookmarks){
            // find element in list, note prevs, next
            if(!gotElement && JSON.stringify(b.location) == JSON.stringify(element.location)){
                gotElement = true;
                continue;
            }
            if(!gotElement){
                ret.previous = b;
            } else {
                ret.next = b;
                break;
            }
        }

        return ret; 
    }
}

class InlineBookmarkTreeDataProvider {

    constructor(inlineBookmarksController){
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;

        this.controller = inlineBookmarksController;
        this.model = new InlineBookmarksDataModel(inlineBookmarksController);
    }

    /** events */

    /** methods */

    getChildren(element){
        return element ? this.model.getChildren(element): this.model.getRoot();
    }

    getParent(element){
        return element.parent;
    }

    getTreeItem(element){
        return {
            id: element.type == NodeType.LOCATION ? this._getId(element.location) : this._getId(element.resource),
            resourceUri: element.resource,
            label: this._formatLabel(element.label),
            iconPath: element.iconPath,
            collapsibleState: element.type == NodeType.LOCATION ? 0 : settings.extensionConfig().view.expanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed,
            command: element.type == NodeType.LOCATION && element.location ? {
                command: 'inlineBookmarks.jumpToRange',
                arguments: [element.location.uri, element.location.range],
                title: 'JumpTo'
            } : 0
        };
    }

    /* 
    Hash object to unique ID.
    */
    _getId(o) {
        return crypto.createHash('sha1').update(JSON.stringify(o)).digest('hex');
    }

    _formatLabel(label){
        if(!settings.extensionConfig().view.words.hide || !label){
            return label;
        }
        let words = Object.values(this.controller.words).flat(1);
        return words.reduce((prevs, word) => prevs.replace(new RegExp( word ,"g"), ""), label);  //replace tags in matches.
    }

    /** other methods */

    refresh(){
        this._onDidChangeTreeData.fire();
    }
}


module.exports = {
    InlineBookmarksCtrl:InlineBookmarksCtrl,
    InlineBookmarkTreeDataProvider:InlineBookmarkTreeDataProvider,
    NodeType:NodeType
};
