'use strict';
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * 
 * */
/** imports */
const vscode = require('vscode');
const settings = require('./settings');
const {InlineBookmarksCtrl, InlineBookmarkTreeDataProvider} = require('./features/inlineBookmarks');


function editorJumptoRange(range, editor) {

    editor = editor || vscode.window.activeTextEditor; //provided editor or fall back to active

    let revealType = vscode.TextEditorRevealType.InCenter;
    let selection = new vscode.Selection(range.start.line, range.start.character, range.end.line, range.end.character);

    if (range.start.line === editor.selection.active.line) {
        revealType = vscode.TextEditorRevealType.InCenterIfOutsideViewport;
    }

    editor.selection = selection;
    editor.revealRange(selection, revealType);
}

function editorFindNearestBookmark(documentUri, treeDataProvider, anchor, overrideStrategy){
    let root = treeDataProvider.getChildren().find(f => f.name == documentUri.toString());
    if (!root){
        return;  // file not found
    }

    //select bookmark that is closest to selection (or center of screen)
    let focusLine = anchor.line;

    // FollowMode 1 (default): nearest Bookmark
    function strategyNearestBookmark(previous, current) {
        if(!previous) return current;
        return Math.abs(focusLine - current.location.range.start.line) <= Math.abs(focusLine - previous.location.range.start.line) ? current : previous;
    }

    // FollowMode 2: previous Bookmark - aka chapter style selection
    function strategyLastKnownBookmark(previous, current) {
        // return the current bookmark if the user clicked on a bookmark line
        // return the last known aka previous Bookmark else
        if(!previous) return current;
        return focusLine >= current.location.range.start.line && focusLine - current.location.range.start.line <= focusLine - previous.location.range.start.line ? current : previous; 
    }

    let followMode = strategyNearestBookmark;
    let strategy = overrideStrategy || settings.extensionConfig().view.followMode;

    switch (strategy) {
        case "chapter":
            followMode = strategyLastKnownBookmark;
            break;
        case "nearest":
        default:
            followMode = strategyNearestBookmark;
    }

    let focusBookmark = treeDataProvider
        .getChildren(root)
        .reduce( (prevs, current) => followMode(prevs, current), null);

    return focusBookmark;
}



function onActivate(context) {
    const auditTags = new InlineBookmarksCtrl(context);
    const treeDataProvider = new InlineBookmarkTreeDataProvider(auditTags);

    var activeEditor = vscode.window.activeTextEditor;

    /** register views */
    const treeView = vscode.window.createTreeView('inlineBookmarksExplorer', { treeDataProvider: treeDataProvider });
    /*
    context.subscriptions.push(treeView);
    */
    /*
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider("inlineBookmarksExplorer", treeDataProvider)
    );
    */
    
    /** register commands */
    context.subscriptions.push(
        vscode.commands.registerCommand("inlineBookmarks.jumpToRange", (documentUri, range) => {
            vscode.workspace.openTextDocument(documentUri).then(doc => {
                vscode.window.showTextDocument(doc).then(editor => {
                    editorJumptoRange(range, editor);
                });
            });
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("inlineBookmarks.refresh", () => {
            auditTags.commands.refresh();
            treeDataProvider.refresh();
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("inlineBookmarks.toggleShowVisibleFilesOnly", () => {
            settings.extensionConfig().update("view.showVisibleFilesOnly", !settings.extensionConfig().view.showVisibleFilesOnly);
            auditTags.commands.refresh();
            treeDataProvider.refresh();
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("inlineBookmarks.toggleViewKeepFilesExpanded", () => {
            settings.extensionConfig().update("view.expanded", !settings.extensionConfig().view.expanded);
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("inlineBookmarks.jumpToNext", () => {
            let element;
            const lineMode = settings.extensionConfig().view.lineMode;

            if (treeView.visible && treeView.selection.length && lineMode === "selected-bookmark") {
                //treview is visible and item selected.  If lineMode, ignore the current selected bookmark and rely on "chapter" below.
                element = treeView.selection[0];
            } else {
                //no select, find nearest bookmark in editor
                if(!activeEditor || !activeEditor.selections.length || !activeEditor.document){
                    return;
                }
                element = editorFindNearestBookmark(activeEditor.document.uri, treeDataProvider, activeEditor.selections[0].anchor, "chapter");
            }
            if(!element){
                return;
            }
            let neighbors = treeDataProvider.model.getNeighbors(element);
            let target = neighbors.next;
            if(lineMode === "current-line" && !neighbors.previous && activeEditor.selections[0].anchor.line < element.location.range.start.line){
                // When lineMode is enabled, the chapter "next" target is almost always correct, except when the anchor is before the first bookmark
                target = element;
            }
            if(target){
                vscode.workspace.openTextDocument(target.location.uri).then(doc => {
                    vscode.window.showTextDocument(doc).then(editor => {
                        editorJumptoRange(target.location.range, editor);
                    });
                });
            }
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("inlineBookmarks.jumpToPrevious", () => {
            let element;
            const lineMode = settings.extensionConfig().view.lineMode;

            if (treeView.visible && treeView.selection.length && lineMode === "selected-bookmark") {
                //treview is visible and item selected.  If lineMode, ignore the current selected bookmark and rely on "chapter" below.
                element = treeView.selection[0];
            } else {
                //no select, find nearest bookmark in editor
                if(!activeEditor || !activeEditor.selections.length || !activeEditor.document){
                    return;
                }
                element = editorFindNearestBookmark(activeEditor.document.uri, treeDataProvider, activeEditor.selections[0].anchor, "chapter");
            }
            if(!element){
                return;
            }
            let neighbors = treeDataProvider.model.getNeighbors(element);
            let target = neighbors.previous;
            if(lineMode === "current-line" && activeEditor.selections[0].anchor.line > element.location.range.start.line){
                // When lineMode is enabled, the chapter "prev" target is almost always wrong, so override to "element" except when the anchor is on the same line as the bookmark
                target = element;
            }
            if(target){
                vscode.workspace.openTextDocument(target.location.uri).then(doc => {
                    vscode.window.showTextDocument(doc).then(editor => {
                        editorJumptoRange(target.location.range, editor);
                    });
                });
            }
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("inlineBookmarks.setTreeViewFilterWords", (words) => {
            if(!words || !words.length){
                //show dialog?
                let options = {
                    prompt: "Filter Bookmarks View:",
                    placeHolder: "(e.g. @audit-info; @follow-up; leave empty to disable filter)"
                };
                
                vscode.window.showInputBox(options).then(value => {
                    value = value || "";
                    value = value.trim().split(/[\s;]+/).map(v => v.trim()).filter(v => v.length > 0);
                    treeDataProvider.setTreeViewFilterWords(value);
                    auditTags.commands.refresh();
                    treeDataProvider.refresh();
                });
            } else {
                //arg provided - allow other extensions to set filters
                treeDataProvider.setTreeViewFilterWords(words);
                auditTags.commands.refresh();
                treeDataProvider.refresh();
            }
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("inlineBookmarks.debug.state.reset", () => {
            auditTags.resetWorkspace();
            auditTags.loadFromWorkspace();
            treeDataProvider.refresh();
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("inlineBookmarks.showSelectBookmark", () => {
            auditTags.commands.showSelectBookmark();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("inlineBookmarks.showSelectVisibleBookmark", () => {
            auditTags.commands.showSelectVisibleBookmark();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("inlineBookmarks.listBookmarks", () => {
            auditTags.commands.showListBookmarks();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("inlineBookmarks.listVisibleBookmarks", () => {
            auditTags.commands.showListVisibleBookmarks();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("inlineBookmarks.scanWorkspace", () => {
            auditTags.commands.scanWorkspaceBookmarks();
        })
    );

    

    /** module init */
    auditTags.commands.refresh();
    treeDataProvider.refresh();
    onDidChange();

    /** event setup */
    /***** OnChange */
    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if (editor) {
            onDidChange(editor);
        }
    }, null, context.subscriptions);
    /***** OnChange */
    vscode.workspace.onDidChangeTextDocument(event => {
        if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
            onDidChange(vscode.window.activeTextEditor, event);
        }
    }, null, context.subscriptions);
    /***** OnSave */

    vscode.workspace.onDidSaveTextDocument(document => {
        onDidSave(vscode.window.activeTextEditor);  
    }, null, context.subscriptions);
    
    /****** OnOpen */
    vscode.workspace.onDidOpenTextDocument(document => {
        onDidSave(vscode.window.activeTextEditor);  
    }, null, context.subscriptions);

    /****** OnClose */
    vscode.workspace.onDidCloseTextDocument(document => {
        onDidSave();  
    }, null, context.subscriptions);

    /****** onDidChangeTextEditorSelection */
    vscode.window.onDidChangeTextEditorSelection(event /* TextEditorVisibleRangesChangeEvent */ => {
        onDidSelectionChange(event);
    }, null, context.subscriptions);

    /************* handler */
    async function onDidChange(editor, event) {
        return new Promise((resolve,reject) => {
            if(settings.extensionConfig().enable){
                auditTags.decorate(editor);
            }
            treeDataProvider.refresh();
            resolve();
        });
    }
    async function onDidSave(editor) {
        return new Promise((resolve,reject) => {
            if(editor && settings.extensionConfig().enable){
                auditTags.decorate(editor);
            }
            treeDataProvider.refresh();
            resolve();
        });
    }
    async function onDidSelectionChange(event){
        if(!treeView.visible || !settings.extensionConfig().view.follow){
            return;  // not visible, no action
        }
        
        let documentUri = event.textEditor.document.uri;

        if(event.textEditor.visibleRanges.length <= 0 || event.selections.length <= 0){
            return;  // no visible range open; no selection
        }

        let focusBookmark = editorFindNearestBookmark(documentUri, treeDataProvider, event.selections[0].anchor);

        if(!focusBookmark){
            return; //no bookmark found
        }

        treeView.reveal(focusBookmark, {selected:true, focus:false});
    }
}

/* exports */
exports.activate = onActivate;