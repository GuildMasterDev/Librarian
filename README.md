# Librarian - Personal Library Manager

A beautiful Electron application for managing your personal book collection. Keep track of what you're reading, organize your library, and discover new books.

**App ID**: `me.davidcanhelp.Librarian`  
**Version**: 1.0.0  
**Platform**: macOS, Windows, Linux

## Features

- **Book Management**: Add, edit, and delete books from your library
- **Reading Status Tracking**: Mark books as unread, currently reading, completed, or incomplete
- **Favorites**: Mark your favorite books for quick access
- **Reading Progress**: Track your reading progress with page counts
- **Book Covers**: Automatically fetch book covers from online sources
- **ISBN Lookup**: Search for book details using ISBN
- **Search & Filter**: Search through your library and filter by status
- **Notes**: Add personal notes to each book
- **Ratings**: Rate completed books with 1-5 stars

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate app icons (requires ImageMagick):
   ```bash
   ./generate-icon.sh
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Usage

### Adding Books

1. Click the "**+ Add Book**" button
2. Enter book details manually or use ISBN lookup
3. The app will automatically fetch cover images when available
4. Mark as favorite if desired
5. Set the initial reading status

### Managing Your Library

- **View Details**: Click "View" on any book card to see full details
- **Edit Books**: Click "Edit" to update book information
- **Delete Books**: Click "Delete" to remove a book from your library
- **Update Progress**: For books you're currently reading, update your page progress
- **Mark Complete**: When finished reading, mark the book as complete and add a rating

### Filtering Your Library

Use the filter buttons to view:
- All Books
- ⭐ Favorites
- 📖 Currently Reading
- ✅ Completed
- 📚 Unread
- ⏸️ Incomplete (abandoned books)

### Keyboard Shortcuts

- `Cmd/Ctrl + N`: Add new book
- `Cmd/Ctrl + F`: Focus search field
- `Cmd/Ctrl + R`: Reload application
- `Alt + Cmd/Ctrl + I`: Toggle developer tools

## Data Storage

Your library data is stored locally using SQLite in your user data directory. The database includes:
- Book metadata (title, author, ISBN, etc.)
- Reading status and progress
- Personal notes and ratings
- Cover image URLs

## Technologies Used

- **Electron**: Cross-platform desktop application framework
- **SQLite3**: Local database storage
- **Vanilla JavaScript**: Frontend logic
- **CSS3**: Styling with gradients and animations
- **Axios**: HTTP requests for book API integration
- **Open Library API**: Book cover and metadata fetching
- **Google Books API**: Additional book information source

## License

MIT