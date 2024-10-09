import * as vscode from 'vscode';
import * as path from 'path';
import { promises as fs } from 'fs';
import * as os from 'os';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.grabEmails', grabEmails)
    );
}

export function deactivate() {}

async function grabEmails() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return showMessage('No editor active. Open a file to continue.', 'info');
    }

    const emails = extractEmails(editor.document.getText());
    if (emails.length > 0) {
        await createEmailFile(emails);
    } else {
        showMessage('No emails had been found.', 'info');
    }
}

function extractEmails(text: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return text.match(emailRegex) || [];
}

async function createEmailFile(emails: string[]) {
    const filePath = path.join(os.tmpdir(), 'emails.txt');

    try {
        await fs.writeFile(filePath, emails.join('\n'), 'utf8');
        await vscode.workspace.openTextDocument(filePath).then(doc => vscode.window.showTextDocument(doc));
        showMessage(`File created: ${filePath}`, 'info');
    } catch (error) {
        showMessage(`Error creating file: ${error}`, 'error');
    }
}

function showMessage(message: string, type: 'info' | 'error' = 'info') {
    const showMessageFn = type === 'error' ? vscode.window.showErrorMessage : vscode.window.showInformationMessage;
    showMessageFn(message);
}
