let allBooks = [];
let currentFilter = 'all';
let currentBookId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
    setupEventListeners();
    setupIPCListeners();
});

function setupEventListeners() {
    document.getElementById('addBookBtn').addEventListener('click', showAddBookModal);
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('searchISBN').addEventListener('click', searchByISBN);
    document.getElementById('addBookForm').addEventListener('submit', handleAddBook);
    document.getElementById('editBookForm').addEventListener('submit', handleEditBook);
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            filterBooks();
        });
    });
    
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

function setupIPCListeners() {
    window.electronAPI.onShowAddBook(() => {
        showAddBookModal();
    });
    
    window.electronAPI.onFocusSearch(() => {
        document.getElementById('searchInput').focus();
    });
    
    window.electronAPI.onFilterView((event, filter) => {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.click();
            }
        });
    });
}

async function loadBooks() {
    const result = await window.electronAPI.getAllBooks();
    if (result.success) {
        allBooks = result.books;
        displayBooks(allBooks);
        updateStats();
    }
}

function displayBooks(books) {
    const grid = document.getElementById('booksGrid');
    grid.innerHTML = '';
    
    if (books.length === 0) {
        grid.innerHTML = '<div class="empty-state">No books found. Add your first book to get started!</div>';
        return;
    }
    
    books.forEach(book => {
        const bookCard = createBookCard(book);
        grid.appendChild(bookCard);
    });
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.dataset.bookId = book.id;
    
    const statusClass = getStatusClass(book.reading_status);
    const favoriteIcon = book.is_favorite ? '⭐' : '';
    
    let progressBar = '';
    if (book.reading_status === 'reading' && book.page_count) {
        const progress = (book.current_page / book.page_count) * 100;
        progressBar = `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
                <span class="progress-text">${book.current_page}/${book.page_count} pages</span>
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="book-cover">
            ${book.cover_url ? 
                `<img src="${book.cover_url}" alt="${book.title}" onerror="this.style.display='none'">` :
                `<div class="book-cover-placeholder">${book.title.charAt(0)}</div>`
            }
            ${favoriteIcon ? `<span class="favorite-badge">${favoriteIcon}</span>` : ''}
        </div>
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            ${book.author ? `<p class="book-author">by ${book.author}</p>` : ''}
            <span class="book-status ${statusClass}">${formatStatus(book.reading_status)}</span>
            ${progressBar}
            ${book.rating ? `<div class="book-rating">${'⭐'.repeat(book.rating)}</div>` : ''}
        </div>
        <div class="book-actions">
            <button onclick="viewBookDetails(${book.id})">View</button>
            <button onclick="editBook(${book.id})">Edit</button>
            <button onclick="deleteBook(${book.id})" class="delete-btn">Delete</button>
        </div>
    `;
    
    return card;
}

function getStatusClass(status) {
    const classes = {
        'unread': 'status-unread',
        'reading': 'status-reading',
        'completed': 'status-completed',
        'incomplete': 'status-incomplete'
    };
    return classes[status] || '';
}

function formatStatus(status) {
    const labels = {
        'unread': 'Unread',
        'reading': 'Currently Reading',
        'completed': 'Completed',
        'incomplete': 'Incomplete'
    };
    return labels[status] || status;
}

function filterBooks() {
    let filteredBooks = [...allBooks];
    
    switch(currentFilter) {
        case 'favorites':
            filteredBooks = allBooks.filter(book => book.is_favorite);
            break;
        case 'reading':
            filteredBooks = allBooks.filter(book => book.reading_status === 'reading');
            break;
        case 'completed':
            filteredBooks = allBooks.filter(book => book.reading_status === 'completed');
            break;
        case 'unread':
            filteredBooks = allBooks.filter(book => book.reading_status === 'unread');
            break;
        case 'incomplete':
            filteredBooks = allBooks.filter(book => book.reading_status === 'incomplete');
            break;
    }
    
    displayBooks(filteredBooks);
    updateStats(filteredBooks);
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    if (!query) {
        filterBooks();
        return;
    }
    
    const searchResults = allBooks.filter(book => 
        book.title.toLowerCase().includes(query) ||
        (book.author && book.author.toLowerCase().includes(query)) ||
        (book.genre && book.genre.toLowerCase().includes(query)) ||
        (book.notes && book.notes.toLowerCase().includes(query))
    );
    
    displayBooks(searchResults);
    updateStats(searchResults);
}

function updateStats(books = allBooks) {
    document.getElementById('totalBooks').textContent = `Total: ${books.length} book${books.length !== 1 ? 's' : ''}`;
    
    const filterLabels = {
        'all': 'All Books',
        'favorites': 'Favorites',
        'reading': 'Currently Reading',
        'completed': 'Completed',
        'unread': 'Unread',
        'incomplete': 'Incomplete'
    };
    
    document.getElementById('currentFilter').textContent = `Showing: ${filterLabels[currentFilter]}`;
}

function showAddBookModal() {
    document.getElementById('addBookModal').style.display = 'block';
    document.getElementById('addBookForm').reset();
}

async function searchByISBN() {
    const isbn = document.getElementById('isbnSearch').value.trim();
    if (!isbn) return;
    
    const result = await window.electronAPI.getBookByISBN(isbn);
    if (result.success && result.book) {
        const book = result.book;
        document.getElementById('title').value = book.title || '';
        document.getElementById('author').value = book.author || '';
        document.getElementById('isbn').value = isbn;
        document.getElementById('publisher').value = book.publisher || '';
        document.getElementById('publicationYear').value = book.publication_year || '';
        document.getElementById('genre').value = book.genre || '';
        document.getElementById('pageCount').value = book.page_count || '';
        document.getElementById('coverUrl').value = book.cover_url || '';
    } else {
        alert('Could not find book details for this ISBN');
    }
}

async function handleAddBook(e) {
    e.preventDefault();
    
    const book = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        isbn: document.getElementById('isbn').value,
        publisher: document.getElementById('publisher').value,
        publication_year: document.getElementById('publicationYear').value || null,
        genre: document.getElementById('genre').value,
        page_count: document.getElementById('pageCount').value || null,
        cover_url: document.getElementById('coverUrl').value,
        notes: document.getElementById('notes').value,
        is_favorite: document.getElementById('isFavorite').checked ? 1 : 0,
        reading_status: document.getElementById('readingStatus').value
    };
    
    const result = await window.electronAPI.addBook(book);
    if (result.success) {
        document.getElementById('addBookModal').style.display = 'none';
        loadBooks();
    } else {
        alert('Error adding book: ' + result.error);
    }
}

async function viewBookDetails(id) {
    const result = await window.electronAPI.getBook(id);
    if (result.success) {
        const book = result.book;
        const modal = document.getElementById('bookDetailsModal');
        const content = modal.querySelector('.book-details-content');
        
        content.innerHTML = `
            <div class="book-detail-header">
                ${book.cover_url ? 
                    `<img src="${book.cover_url}" alt="${book.title}" class="detail-cover">` :
                    `<div class="detail-cover-placeholder">${book.title.charAt(0)}</div>`
                }
                <div class="detail-info">
                    <h2>${book.title} ${book.is_favorite ? '⭐' : ''}</h2>
                    ${book.author ? `<p class="detail-author">by ${book.author}</p>` : ''}
                    ${book.isbn ? `<p><strong>ISBN:</strong> ${book.isbn}</p>` : ''}
                    ${book.publisher ? `<p><strong>Publisher:</strong> ${book.publisher}</p>` : ''}
                    ${book.publication_year ? `<p><strong>Year:</strong> ${book.publication_year}</p>` : ''}
                    ${book.genre ? `<p><strong>Genre:</strong> ${book.genre}</p>` : ''}
                    ${book.page_count ? `<p><strong>Pages:</strong> ${book.page_count}</p>` : ''}
                    <p><strong>Status:</strong> <span class="${getStatusClass(book.reading_status)}">${formatStatus(book.reading_status)}</span></p>
                    ${book.rating ? `<p><strong>Rating:</strong> ${'⭐'.repeat(book.rating)}</p>` : ''}
                    ${book.date_finished ? `<p><strong>Finished:</strong> ${new Date(book.date_finished).toLocaleDateString()}</p>` : ''}
                </div>
            </div>
            ${book.notes ? `
                <div class="detail-notes">
                    <h3>Notes</h3>
                    <p>${book.notes}</p>
                </div>
            ` : ''}
            ${book.reading_status === 'reading' && book.page_count ? `
                <div class="reading-progress-section">
                    <h3>Reading Progress</h3>
                    <div class="progress-bar large">
                        <div class="progress-fill" style="width: ${(book.current_page / book.page_count) * 100}%"></div>
                        <span class="progress-text">${book.current_page}/${book.page_count} pages</span>
                    </div>
                    <div class="progress-update">
                        <input type="number" id="progressInput" value="${book.current_page}" min="0" max="${book.page_count}">
                        <button onclick="updateProgress(${book.id})">Update Progress</button>
                        ${book.current_page >= book.page_count ? `
                            <button onclick="markAsComplete(${book.id})" class="complete-btn">Mark as Complete</button>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
        `;
        
        modal.style.display = 'block';
    }
}

async function editBook(id) {
    const result = await window.electronAPI.getBook(id);
    if (result.success) {
        const book = result.book;
        currentBookId = id;
        
        const form = document.getElementById('editBookForm');
        form.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="editTitle">Title *</label>
                    <input type="text" id="editTitle" value="${book.title}" required>
                </div>
                <div class="form-group">
                    <label for="editAuthor">Author</label>
                    <input type="text" id="editAuthor" value="${book.author || ''}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="editIsbn">ISBN</label>
                    <input type="text" id="editIsbn" value="${book.isbn || ''}">
                </div>
                <div class="form-group">
                    <label for="editPublisher">Publisher</label>
                    <input type="text" id="editPublisher" value="${book.publisher || ''}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="editPublicationYear">Publication Year</label>
                    <input type="number" id="editPublicationYear" value="${book.publication_year || ''}" min="1000" max="2100">
                </div>
                <div class="form-group">
                    <label for="editGenre">Genre</label>
                    <input type="text" id="editGenre" value="${book.genre || ''}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="editPageCount">Page Count</label>
                    <input type="number" id="editPageCount" value="${book.page_count || ''}" min="1">
                </div>
                <div class="form-group">
                    <label for="editReadingStatus">Reading Status</label>
                    <select id="editReadingStatus">
                        <option value="unread" ${book.reading_status === 'unread' ? 'selected' : ''}>Unread</option>
                        <option value="reading" ${book.reading_status === 'reading' ? 'selected' : ''}>Currently Reading</option>
                        <option value="completed" ${book.reading_status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="incomplete" ${book.reading_status === 'incomplete' ? 'selected' : ''}>Incomplete (Abandoned)</option>
                    </select>
                </div>
            </div>
            
            ${book.reading_status === 'reading' ? `
                <div class="form-group">
                    <label for="editCurrentPage">Current Page</label>
                    <input type="number" id="editCurrentPage" value="${book.current_page || 0}" min="0">
                </div>
            ` : ''}
            
            ${book.reading_status === 'completed' ? `
                <div class="form-group">
                    <label for="editRating">Rating</label>
                    <select id="editRating">
                        <option value="">No rating</option>
                        <option value="1" ${book.rating === 1 ? 'selected' : ''}>⭐</option>
                        <option value="2" ${book.rating === 2 ? 'selected' : ''}>⭐⭐</option>
                        <option value="3" ${book.rating === 3 ? 'selected' : ''}>⭐⭐⭐</option>
                        <option value="4" ${book.rating === 4 ? 'selected' : ''}>⭐⭐⭐⭐</option>
                        <option value="5" ${book.rating === 5 ? 'selected' : ''}>⭐⭐⭐⭐⭐</option>
                    </select>
                </div>
            ` : ''}
            
            <div class="form-group">
                <label for="editCoverUrl">Cover Image URL</label>
                <input type="url" id="editCoverUrl" value="${book.cover_url || ''}">
            </div>
            
            <div class="form-group">
                <label for="editNotes">Notes</label>
                <textarea id="editNotes" rows="4">${book.notes || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" id="editIsFavorite" ${book.is_favorite ? 'checked' : ''}>
                    Mark as Favorite
                </label>
            </div>
            
            <div class="form-actions">
                <button type="submit">Save Changes</button>
                <button type="button" class="cancel-btn">Cancel</button>
            </div>
        `;
        
        document.getElementById('editBookModal').style.display = 'block';
    }
}

async function handleEditBook(e) {
    e.preventDefault();
    
    const updatedBook = {
        title: document.getElementById('editTitle').value,
        author: document.getElementById('editAuthor').value,
        isbn: document.getElementById('editIsbn').value,
        publisher: document.getElementById('editPublisher').value,
        publication_year: document.getElementById('editPublicationYear').value || null,
        genre: document.getElementById('editGenre').value,
        page_count: document.getElementById('editPageCount').value || null,
        cover_url: document.getElementById('editCoverUrl').value,
        notes: document.getElementById('editNotes').value,
        is_favorite: document.getElementById('editIsFavorite').checked ? 1 : 0,
        reading_status: document.getElementById('editReadingStatus').value,
        current_page: document.getElementById('editCurrentPage') ? document.getElementById('editCurrentPage').value : 0,
        rating: document.getElementById('editRating') ? document.getElementById('editRating').value : null
    };
    
    const result = await window.electronAPI.updateBook(currentBookId, updatedBook);
    if (result.success) {
        document.getElementById('editBookModal').style.display = 'none';
        loadBooks();
    } else {
        alert('Error updating book: ' + result.error);
    }
}

async function deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
        const result = await window.electronAPI.deleteBook(id);
        if (result.success) {
            loadBooks();
        } else {
            alert('Error deleting book: ' + result.error);
        }
    }
}

async function updateProgress(id) {
    const newProgress = document.getElementById('progressInput').value;
    const result = await window.electronAPI.updateReadingProgress(id, newProgress);
    if (result.success) {
        viewBookDetails(id);
        loadBooks();
    }
}

async function markAsComplete(id) {
    const rating = prompt('Rate this book (1-5 stars, or leave empty for no rating):');
    const numRating = rating ? parseInt(rating) : null;
    
    if (numRating && (numRating < 1 || numRating > 5)) {
        alert('Please enter a rating between 1 and 5');
        return;
    }
    
    const result = await window.electronAPI.markAsFinished(id, numRating);
    if (result.success) {
        document.getElementById('bookDetailsModal').style.display = 'none';
        loadBooks();
    }
}