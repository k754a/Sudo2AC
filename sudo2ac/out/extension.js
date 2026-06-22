"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    //status bar
    const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    status.command = "sudo2ac.transform";
    context.subscriptions.push(status);
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //Ok, this creates a command, then when its executed it creates a webview
    const cmd = vscode.commands.registerCommand('sudo2ac.transform', async () => {
        //we need them inside so they update
        const config = vscode.workspace.getConfiguration("sudo2ac"); // get the config
        const model = config.get("model") ?? "gemma4:e2b"; //check for a model, if not use default
        const systemPrompt = config.get("systemPrompt") ?? ""; //check for a system prompt
        //ok get the active text editor, and check if there is one
        const editor = vscode.window.activeTextEditor;
        if (!editor) { //there isnt one
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }
        //now we check that we selected some text, if not we show an error message
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        if (!selection || selection.isEmpty) { //there is no selected text
            vscode.window.showErrorMessage('No text selected.');
            return;
        }
        //now that we know everything is good we need to get the context around it
        const doc = editor.document;
        // full file context 
        const startline = 0;
        const endline = doc.lineCount - 1;
        // grab everything
        const fullText = doc.getText(new vscode.Range(new vscode.Position(startline, 0), new vscode.Position(endline, doc.lineAt(endline).text.length)));
        const contextText = fullText;
        //make our prompt
        const prompt = `${systemPrompt} Context: ${contextText} Selected Code: ${selectedText}`;
        //start the animation and create the webview
        status.show();
        status.text = "Ollama: Thinking...";
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                prompt,
                stream: true,
                "raw": false,
                "options": {
                    "temperature": 0.2
                }
            })
        }).catch(() => {
            vscode.window.showErrorMessage('Could not reach Ollama — is it running?');
            return null;
        });
        if (!response)
            return;
        status.text = "Ollama: Streaming...";
        //ok now we need to update and stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let full = "";
        let thinkingFull = "";
        let buffer = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            // Decode the chunk and append it to the buffer
            buffer += decoder.decode(value, { stream: true });
            // Split the buffer into lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || ""; // Keep the last line in the buffer 
            for (const line of lines) {
                if (!line.trim())
                    continue; //skip empty lines
                try {
                    const json = JSON.parse(line);
                    if (json.response) {
                        full += json.response;
                    }
                    if (json.thinking) {
                        thinkingFull += json.thinking;
                    }
                    status.text = `Ollama: ${full.slice(-40)}`;
                }
                catch (e) {
                    //ignore
                }
            }
        }
        const cleaned = full
            .replace(/^```[\w]*\n?/, '') // remove ``` 
            .replace(/\n?```$/, ''); // remove ``` 
        //done
        status.text = "Ollama: Done!";
        vscode.window.showInformationMessage('Ollama: Done!');
        //ok, now we replace the text we highlighted with the response
        editor.edit(editBuilder => {
            editBuilder.replace(selection, cleaned);
        });
    });
    context.subscriptions.push(cmd);
    let disposable = vscode.commands.registerCommand('sudo2ac.opensettings', async () => {
        await vscode.commands.executeCommand('workbench.action.openSettings', 'sudo2ac.');
    });
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // // The commandId parameter must match the command field in package.json
    // const disposable = vscode.commands.registerCommand('sudo2ac.helloWorld', () => {
    // 	// The code you place here will be executed every time your command is executed
    // 	// Display a message box to the user
    // 	vscode.window.showInformationMessage('Hello World from Sudo2AC!');
    // });
    context.subscriptions.push(disposable);
}
// This method is called when your extension is deactivated
function deactivate() { }
