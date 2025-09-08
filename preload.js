const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    addBook: (book) => ipcRenderer.invoke('db:addBook', book),
    updateBook: (id, book) => ipcRenderer.invoke('db:updateBook', id, book),
    deleteBook: (id) => ipcRenderer.invoke('db:deleteBook', id),
    getBook: (id) => ipcRenderer.invoke('db:getBook', id),
    getAllBooks: () => ipcRenderer.invoke('db:getAllBooks'),
    searchBooks: (query) => ipcRenderer.invoke('db:searchBooks', query),
    getFavorites: () => ipcRenderer.invoke('db:getFavorites'),
    getBooksByStatus: (status) => ipcRenderer.invoke('db:getBooksByStatus', status),
    updateReadingProgress: (id, currentPage) => ipcRenderer.invoke('db:updateReadingProgress', id, currentPage),
    markAsFinished: (id, rating) => ipcRenderer.invoke('db:markAsFinished', id, rating),
    searchBookOnline: (query) => ipcRenderer.invoke('api:searchBook', query),
    getBookByISBN: (isbn) => ipcRenderer.invoke('api:getBookByISBN', isbn),
    
    onShowAddBook: (callback) => {
        ipcRenderer.on('show-add-book', callback);
    },
    onFocusSearch: (callback) => {
        ipcRenderer.on('focus-search', callback);
    },
    onFilterView: (callback) => {
        ipcRenderer.on('filter-view', callback);
    }
});