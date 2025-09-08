const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

class Database {
    constructor() {
        const dbPath = path.join(app.getPath('userData'), 'library.db');
        this.db = new sqlite3.Database(dbPath);
        this.initializeDatabase();
    }

    initializeDatabase() {
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS books (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    isbn TEXT,
                    title TEXT NOT NULL,
                    author TEXT,
                    publisher TEXT,
                    publication_year INTEGER,
                    genre TEXT,
                    cover_url TEXT,
                    notes TEXT,
                    is_favorite INTEGER DEFAULT 0,
                    reading_status TEXT DEFAULT 'unread',
                    date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
                    date_finished DATETIME,
                    rating INTEGER,
                    page_count INTEGER,
                    current_page INTEGER DEFAULT 0
                )
            `);

            this.db.run(`
                CREATE INDEX IF NOT EXISTS idx_title ON books(title);
            `);

            this.db.run(`
                CREATE INDEX IF NOT EXISTS idx_author ON books(author);
            `);

            this.db.run(`
                CREATE INDEX IF NOT EXISTS idx_reading_status ON books(reading_status);
            `);
        });
    }

    addBook(book) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO books (isbn, title, author, publisher, publication_year, genre, cover_url, notes, is_favorite, reading_status, page_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            this.db.run(sql, [
                book.isbn || null,
                book.title,
                book.author || null,
                book.publisher || null,
                book.publication_year || null,
                book.genre || null,
                book.cover_url || null,
                book.notes || null,
                book.is_favorite || 0,
                book.reading_status || 'unread',
                book.page_count || null
            ], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    updateBook(id, book) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE books SET
                    isbn = ?, title = ?, author = ?, publisher = ?, 
                    publication_year = ?, genre = ?, cover_url = ?, notes = ?,
                    is_favorite = ?, reading_status = ?, page_count = ?, current_page = ?,
                    date_finished = ?, rating = ?
                WHERE id = ?
            `;
            this.db.run(sql, [
                book.isbn, book.title, book.author, book.publisher,
                book.publication_year, book.genre, book.cover_url, book.notes,
                book.is_favorite, book.reading_status, book.page_count, book.current_page,
                book.date_finished, book.rating, id
            ], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    deleteBook(id) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM books WHERE id = ?', [id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    getBook(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    getAllBooks() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM books ORDER BY date_added DESC', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    searchBooks(query) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM books 
                WHERE title LIKE ? OR author LIKE ? OR genre LIKE ? OR notes LIKE ?
                ORDER BY date_added DESC
            `;
            const searchPattern = `%${query}%`;
            this.db.all(sql, [searchPattern, searchPattern, searchPattern, searchPattern], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    getFavorites() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM books WHERE is_favorite = 1 ORDER BY title', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    getBooksByStatus(status) {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM books WHERE reading_status = ? ORDER BY date_added DESC', [status], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    updateReadingProgress(id, currentPage) {
        return new Promise((resolve, reject) => {
            this.db.run('UPDATE books SET current_page = ? WHERE id = ?', [currentPage, id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    markAsFinished(id, rating) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE books SET 
                    reading_status = 'completed',
                    date_finished = CURRENT_TIMESTAMP,
                    rating = ?
                WHERE id = ?
            `;
            this.db.run(sql, [rating, id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    close() {
        this.db.close();
    }
}

module.exports = Database;