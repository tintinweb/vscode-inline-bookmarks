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
const os = require("os");

class Commands {
    constructor(controller) {
        this.controller = controller;
    }

    refresh() {
        Object.keys(this.controller.bookmarks).forEach(uri => {
            vscode.workspace.openTextDocument(vscode.Uri.parse(uri)).then(document => {
                this.controller.updateBookmarks(document);
            });
        }, this);
    }

    showSelectBookmark(filter, placeHolder) {

        let entries = [];
        Object.keys(this.controller.bookmarks).forEach(uri => {
            let resource = vscode.Uri.parse(uri).fsPath;
            let fname = path.parse(resource).base;

            if(!filter(resource)){
                return;
            }

            Object.keys(this.controller.bookmarks[uri]).forEach(cat => {
                this.controller.bookmarks[uri][cat].forEach(b => {
                    entries.push({
                        label: b.text,
                        description: fname,
                        target: new vscode.Location(resource, b.range)
                    });
                });
            });

        }, this);

        vscode.window.showQuickPick(entries, { placeHolder: placeHolder || 'Select bookmarks' }).then(item => {
            vscode.commands.executeCommand("inlineBookmarks.jumpToRange", item.target.uri, item.target.range);
        });
    }

    showSelectVisibleBookmark() {
        let visibleEditorUris = vscode.window.visibleTextEditors.map(te => te.document.uri.fsPath);
        this.showSelectBookmark((resFsPath) => visibleEditorUris.includes(resFsPath), "Select visible bookmarks");
    }

    showListBookmarks(filter) {

        if (!vscode.window.outputChannel) {
            vscode.window.outputChannel = vscode.window.createOutputChannel('inlineBookmarks');
        }

        if (!vscode.window.outputChannel) return;
        vscode.window.outputChannel.clear();

        let entries = [];
        Object.keys(this.controller.bookmarks).forEach(uri => {
            let resource = vscode.Uri.parse(uri).fsPath;
            let fname = path.parse(resource).base;

            if(!filter(resource)){
                return;
            }

            Object.keys(this.controller.bookmarks[uri]).forEach(cat => {
                this.controller.bookmarks[uri][cat].forEach(b => {
                    entries.push({
                        label: b.text,
                        description: fname,
                        target: new vscode.Location(resource, b.range)
                    });
                });
            });

        }, this);

        if (entries.length === 0) {
            vscode.window.showInformationMessage('No results');
            return;
        }

        entries.forEach(function (v, i, a) {
            var patternA = '#' + (i + 1) + '\t' + v.target.uri + '#' + (v.target.range.start.line + 1);
            var patternB = '#' + (i + 1) + '\t' + v.target.uri + ':' + (v.target.range.start.line + 1) + ':' + (v.target.range.start.character + 1);
            var patterns = [patternA, patternB];

            var patternType = 0;
            if (os.platform() == "linux") {
                patternType = 1;
            }
            patternType = +!patternType;

            vscode.window.outputChannel.appendLine(patterns[patternType]);
            vscode.window.outputChannel.appendLine('\t' + v.label + '\n');
        });
        vscode.window.outputChannel.show();
    }

    showListVisibleBookmarks() {
        let visibleEditorUris = vscode.window.visibleTextEditors.map(te => te.document.uri.fsPath);
        this.showListBookmarks((resFsPath) => visibleEditorUris.includes(resFsPath));
    }

    scanWorkspaceBookmarks() {

        function arrayToSearchGlobPattern(config) {
            return Array.isArray(config) ?
                '{' + config.join(',') + '}'
                : (typeof config == 'string' ? config : '');
        }

        var includePattern = arrayToSearchGlobPattern(settings.extensionConfig().search.includes) || '{**/*}';
        var excludePattern = arrayToSearchGlobPattern(settings.extensionConfig().search.excludes);
        var limit = settings.extensionConfig().search.maxFiles;

        let that = this;
    
        vscode.workspace.findFiles(includePattern, excludePattern, limit).then(function (files) {
    
            if (!files || files.length === 0) {
                console.log('No files found' );
                return;
            }
    
            var totalFiles = files.length;

            for (var i = 0; i < totalFiles; i++) {
    
                vscode.workspace.openTextDocument(files[i]).then((document) => {
                    that.controller.updateBookmarks(document);
                    //NOP
                }, (err) => {
                    console.error(err);
                });
    
            }
            
        }, (err) => {
            console.error(err);
        });
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

    hasBookmarks() {
        return !!this.bookmarks;
    }

    async decorate(editor) {
        if (!editor || !editor.document /*|| editor.document.fileName.startsWith("extension-output-")*/) return; //decorate list of inline comments

        this._clearBookmarksOfFile(editor.document);

        if (this._extensionIsBlacklisted(editor.document.fileName)) return;

        for (var style in this.words) {
            if (!this.words.hasOwnProperty(style) || this.words[style].length == 0 || this._wordIsOnIgnoreList(this.words[style])) {
                continue;
            }
            this._decorateWords(editor, this.words[style], style, editor.document.fileName.startsWith("extension-output-")); //dont add to bookmarks if we're decorating an extension-output
        }

        this.saveToWorkspace(); //update workspace
    }

    async updateBookmarks(document) {
        if (!document || document.fileName.startsWith("extension-output-")) return;

        this._clearBookmarksOfFile(document);

        if (this._extensionIsBlacklisted(document.fileName)) return;

        for (var style in this.words) {
            if (!this.words.hasOwnProperty(style) || this.words[style].length == 0 || this._wordIsOnIgnoreList(this.words[style])) {
                continue;
            }
            this._updateBookmarksForWordAndStyle(document, this.words[style], style);
        }

        this.saveToWorkspace(); //update workspace
    }

    /** -- private -- */

    _extensionIsBlacklisted(fileName) {
        let ignoreList = settings.extensionConfig().exceptions.file.extensions.ignore;
        if (!ignoreList || ignoreList.length === 0) return false;
        return this._commaSeparatedStringToUniqueList(ignoreList).some(ext => fileName.endsWith(ext.trim()));
    }

    _wordIsOnIgnoreList(word) {
        let ignoreList = settings.extensionConfig().exceptions.words.ignore;
        return this._commaSeparatedStringToUniqueList(ignoreList).some(ignoreWord => word.startsWith(ignoreWord.trim()));
    }

    _commaSeparatedStringToUniqueList(s) {
        if (!s) return [];
        return [...new Set(s.trim().split(',').map(e => e.trim()).filter(e => e.length))];
    }

    async _decorateWords(editor, words, style, noAdd) {
        const decoStyle = this.styles[style] || this.styles['default'];

        let locations = this._findWords(editor.document, words);
        editor.setDecorations(decoStyle, locations);  // set decorations

        if (locations.length && !noAdd)
            this._addBookmark(editor.document, style, locations);
    }

    async _updateBookmarksForWordAndStyle(document, words, style) {

        let locations = this._findWords(document, words);

        if (locations.length)
            this._addBookmark(document, style, locations);
    }

    _findWords(document, words) {
        const text = document.getText();
        var locations = [];

        words.forEach(function (word) {

            var regEx = new RegExp(word, "g");
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
        if (!this.bookmarks.hasOwnProperty(filename)) return;
        delete this.bookmarks[filename];
    }

    _clearBookmarksOfFileAndStyle(document, style) {
        let filename = document.uri;
        if (!this.bookmarks.hasOwnProperty(filename)) return;
        delete this.bookmarks[filename][style];
    }

    _addBookmark(document, style, locations) {
        let filename = document.uri;
        if (!this.bookmarks.hasOwnProperty(filename)) {
            this.bookmarks[filename] = {};
        }
        this.bookmarks[filename][style] = locations;
    }

    _reLoadWords() {
        let defaultWords = {  // style: arr(regexWords)
            "blue": this._commaSeparatedStringToUniqueList(settings.extensionConfig().default.words.blue),
            "purple": this._commaSeparatedStringToUniqueList(settings.extensionConfig().default.words.purple),
            "green": this._commaSeparatedStringToUniqueList(settings.extensionConfig().default.words.green),
            "red": this._commaSeparatedStringToUniqueList(settings.extensionConfig().default.words.red)
        };

        return { ...defaultWords, ...settings.extensionConfig().expert.custom.words.mapping };
    }

    _getBookmarkDataUri(color) {
        return vscode.Uri.parse(
            "data:image/svg+xml," +
            encodeURIComponent(`<svg version="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" enable-background="new 0 0 48 48"><path fill="${color}" d="M37,43l-13-6l-13,6V9c0-2.2,1.8-4,4-4h18c2.2,0,4,1.8,4,4V43z"/></svg>`)
        );
    }

    _getDecorationType(color) {
        return vscode.window.createTextEditorDecorationType({
            "gutterIconPath": this._getBookmarkDataUri(color),
            "overviewRulerColor": color+"B0",   // this is safe/suitable for the defaults only.  Custom ruler color is handled below.
            "light": {
                "fontWeight": "bold"
            },
            "dark": {
                "color": "Chocolate"
            }
        })
    }

    _reLoadDecorations() {
        const blue      = '#157EFB';
        const green     = '#2FCE7C';
        const purple    = '#C679E0';
        const red       = '#F44336';
        let styles      = {
            "default":  this._getDecorationType(blue),
            "red":      this._getDecorationType(red),
            "blue":     this._getDecorationType(blue),
            "green":    this._getDecorationType(green),
            "purple":   this._getDecorationType(purple)
        };

        let customStyles = settings.extensionConfig().expert.custom.styles;

        for (var decoId in customStyles) {

            if (!customStyles.hasOwnProperty(decoId)) {
                continue;
            }

            let decoOptions = { ...customStyles[decoId] };

            // default to blue if neither an icon path nor an icon color is specified
            if (!decoOptions.gutterIconPath) {
                decoOptions.gutterIconColor = decoOptions.gutterIconColor || blue;
            }

            //apply icon color if provided, otherwise fix the path
            decoOptions.gutterIconPath = decoOptions.gutterIconColor ? this._getBookmarkDataUri(decoOptions.gutterIconColor) : this.context.asAbsolutePath(decoOptions.gutterIconPath);

            //overview
            if (decoOptions.overviewRulerColor) {
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

    resetWorkspace() {
        if (!this._isWorkspaceAvailable()) return; //cannot save
        this.context.workspaceState.update("bookmarks.object", "{}");
    }

    saveToWorkspace() {
        if (!this._isWorkspaceAvailable()) return; //cannot save
        this.context.workspaceState.update("bookmarks.object", JSON.stringify(this.bookmarks));
    }

    loadFromWorkspace() {
        if (!this._isWorkspaceAvailable()) return; //cannot load
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
    FILE: 1,
    LOCATION: 2
};


class InlineBookmarksDataModel {

    /** treedata model */

    constructor(controller) {
        this.controller = controller;
    }

    getRoot() {  /** returns element */
        let fileBookmarks = Object.keys(this.controller.bookmarks);
        
        if (settings.extensionConfig().view.showVisibleFilesOnly) {
            let visibleEditorUris = vscode.window.visibleTextEditors.map(te => te.document.uri.path);
            fileBookmarks = fileBookmarks.filter(v => visibleEditorUris.includes(vscode.Uri.parse(v).path));
        }

        return fileBookmarks.sort().map(v => {
            return {
                resource: vscode.Uri.parse(v),
                tooltip: v,
                name: v,
                type: NodeType.FILE,
                parent: null,
                iconPath: vscode.ThemeIcon.File,
                location: null
            };
        });
    }

    getChildren(element) {
        switch (element.type) {
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
                            parent: element,
                            iconPath: vscode.Uri.file(this.controller.context.asAbsolutePath(path.join("images", `bookmark-${cat}.svg`)))
                        };
                    });
                }).flat(1);

                return bookmarks.sort((a, b) => a.location.range.start.line - b.location.range.start.line);
                break;
        }
    }

    /**
    Find previous and next of element (for goto_next, goto_previous)

    requires current element from tree
    */
    getNeighbors(element) {
        let ret = { previous: null, next: null };
        let parent = element.parent;
        if (!parent) {
            //fake the parent
            parent = { ...element };  //use parent or derive it from bookmark
            parent.type = NodeType.FILE;
            parent.name = element.resource;
        }

        //get all children
        let bookmarks = this.getChildren(parent);

        //lets track if we're at our element.
        let gotElement = false;

        for (let b of bookmarks) {
            // find element in list, note prevs, next
            if (!gotElement && JSON.stringify(b.location) == JSON.stringify(element.location)) {
                gotElement = true;
                continue;
            }
            if (!gotElement) {
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

    constructor(inlineBookmarksController) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;

        this.controller = inlineBookmarksController;
        this.model = new InlineBookmarksDataModel(inlineBookmarksController);

        this.filterTreeViewWords = [];
    }

    /** events */

    /** methods */

    getChildren(element) {
        return element ? this._filterTreeView(this.model.getChildren(element)) : this.model.getRoot();
    }

    getParent(element) {
        return element ? element.parent : element;
    }

    getTreeItem(element) {
        if (!element) {
            return element; // undef
        }
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

    _formatLabel(label) {
        if (!settings.extensionConfig().view.words.hide || !label) {
            return label;
        }
        let words = Object.values(this.controller.words).flat(1);
        return words.reduce((prevs, word) => prevs.replace(new RegExp(word, "g"), ""), label);  //replace tags in matches.
    }

    _filterTreeView(elements) {
        if (!this.filterTreeViewWords || !this.filterTreeViewWords.length) {
            return elements;
        }
        return elements.filter(e => this.filterTreeViewWords.some(rx => new RegExp(rx, 'g').test(e.label)));
    }
    /** other methods */

    setTreeViewFilterWords(words) {
        this.filterTreeViewWords = words;
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }
}


module.exports = {
    InlineBookmarksCtrl: InlineBookmarksCtrl,
    InlineBookmarkTreeDataProvider: InlineBookmarkTreeDataProvider,
    NodeType: NodeType
};
