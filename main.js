const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const Database = require('./database');
const BookAPI = require('./bookAPI');

let mainWindow;
let db;
let bookAPI;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    mainWindow.loadFile('index.html');

    const menu = Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                {
                    label: 'Add Book',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('show-add-book');
                    }
                },
                {
                    label: 'Search',
                    accelerator: 'CmdOrCtrl+F',
                    click: () => {
                        mainWindow.webContents.send('focus-search');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'All Books',
                    click: () => {
                        mainWindow.webContents.send('filter-view', 'all');
                    }
                },
                {
                    label: 'Favorites',
                    click: () => {
                        mainWindow.webContents.send('filter-view', 'favorites');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Currently Reading',
                    click: () => {
                        mainWindow.webContents.send('filter-view', 'reading');
                    }
                },
                {
                    label: 'Completed',
                    click: () => {
                        mainWindow.webContents.send('filter-view', 'completed');
                    }
                },
                {
                    label: 'Unread',
                    click: () => {
                        mainWindow.webContents.send('filter-view', 'unread');
                    }
                },
                {
                    label: 'Incomplete',
                    click: () => {
                        mainWindow.webContents.send('filter-view', 'incomplete');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
                    click: () => {
                        mainWindow.webContents.toggleDevTools();
                    }
                }
            ]
        }
    ]);

    Menu.setApplicationMenu(menu);

    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    db = new Database();
    bookAPI = new BookAPI();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        db.close();
        app.quit();
    }
});

ipcMain.handle('db:addBook', async (event, book) => {
    try {
        const id = await db.addBook(book);
        return { success: true, id };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('db:updateBook', async (event, id, book) => {
    try {
        await db.updateBook(id, book);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('db:deleteBook', async (event, id) => {
    try {
        await db.deleteBook(id);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('db:getBook', async (event, id) => {
    try {
        const book = await db.getBook(id);
        return { success: true, book };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('db:getAllBooks', async () => {
    try {
        const books = await db.getAllBooks();
        return { success: true, books };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('db:searchBooks', async (event, query) => {
    try {
        const books = await db.searchBooks(query);
        return { success: true, books };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('db:getFavorites', async () => {
    try {
        const books = await db.getFavorites();
        return { success: true, books };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('db:getBooksByStatus', async (event, status) => {
    try {
        const books = await db.getBooksByStatus(status);
        return { success: true, books };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('db:updateReadingProgress', async (event, id, currentPage) => {
    try {
        await db.updateReadingProgress(id, currentPage);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('db:markAsFinished', async (event, id, rating) => {
    try {
        await db.markAsFinished(id, rating);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('api:searchBook', async (event, query) => {
    try {
        const results = await bookAPI.searchBook(query);
        return { success: true, results };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('api:getBookByISBN', async (event, isbn) => {
    try {
        const book = await bookAPI.getBookByISBN(isbn);
        return { success: true, book };
    } catch (error) {
        return { success: false, error: error.message };
    }
});