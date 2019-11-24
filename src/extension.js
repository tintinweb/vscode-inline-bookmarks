'use strict'
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * 
 * */
/** imports */
const vscode = require('vscode');

const {InlineBookmarksCtrl, InlineBookmarkTreeDataProvider} = require('./features/inlineBookmarks');

function editorJumptoRange(range) {

    let revealType = vscode.TextEditorRevealType.InCenter;
    let selection = new vscode.Selection(range.start.line, range.start.character, range.end.line, range.end.character);

    if (range.start.line === vscode.window.activeTextEditor.selection.active.line) {
        revealType = vscode.TextEditorRevealType.InCenterIfOutsideViewport;
    }

    vscode.window.activeTextEditor.selection = selection;
    vscode.window.activeTextEditor.revealRange(selection, revealType);
}

function onActivate(context) {
    const auditTags = new InlineBookmarksCtrl(context);
    const treeDataProvider = new InlineBookmarkTreeDataProvider(auditTags);

    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor || !activeEditor.document) return;

    /** register views */
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider("inlineBookmarksExplorer", treeDataProvider)
    );

    /** register commands */
    context.subscriptions.push(
        vscode.commands.registerCommand("inlineBookmarks.jumpToRange", (documentUri, range) => {
            vscode.workspace.openTextDocument(documentUri).then(doc => {
                vscode.window.showTextDocument(doc).then(editor => {
                    editorJumptoRange(range);
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
    /** module init */
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

    /************* handler */
    async function onDidChange(editor, event) {
        return new Promise((resolve,reject) => {
            auditTags.decorate(editor);
            resolve();
        });
    }
    
    async function onDidSave(editor) {
        return new Promise((resolve,reject) => {
            auditTags.decorate(editor);
            treeDataProvider.refresh();
            resolve();
        });
    }

}

/* exports */
exports.activate = onActivate;