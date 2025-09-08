const axios = require('axios');

class BookAPI {
    constructor() {
        this.openLibraryAPI = 'https://openlibrary.org';
        this.googleBooksAPI = 'https://www.googleapis.com/books/v1/volumes';
    }

    async searchBook(query) {
        try {
            const response = await axios.get(`${this.googleBooksAPI}?q=${encodeURIComponent(query)}&maxResults=10`);
            
            if (response.data.items) {
                return response.data.items.map(item => this.parseGoogleBook(item));
            }
            return [];
        } catch (error) {
            console.error('Error searching books:', error);
            return [];
        }
    }

    async getBookByISBN(isbn) {
        try {
            const cleanISBN = isbn.replace(/[-\s]/g, '');
            
            const googleResponse = await axios.get(`${this.googleBooksAPI}?q=isbn:${cleanISBN}`);
            if (googleResponse.data.items && googleResponse.data.items.length > 0) {
                return this.parseGoogleBook(googleResponse.data.items[0]);
            }
            
            const openLibResponse = await axios.get(`${this.openLibraryAPI}/isbn/${cleanISBN}.json`);
            if (openLibResponse.data) {
                return await this.parseOpenLibraryBook(openLibResponse.data, cleanISBN);
            }
            
            return null;
        } catch (error) {
            console.error('Error fetching book by ISBN:', error);
            
            try {
                const cleanISBN = isbn.replace(/[-\s]/g, '');
                const openLibResponse = await axios.get(`${this.openLibraryAPI}/isbn/${cleanISBN}.json`);
                if (openLibResponse.data) {
                    return await this.parseOpenLibraryBook(openLibResponse.data, cleanISBN);
                }
            } catch (secondError) {
                console.error('Secondary fetch attempt failed:', secondError);
            }
            
            return null;
        }
    }

    parseGoogleBook(item) {
        const volumeInfo = item.volumeInfo || {};
        const imageLinks = volumeInfo.imageLinks || {};
        
        return {
            title: volumeInfo.title || '',
            author: volumeInfo.authors ? volumeInfo.authors.join(', ') : '',
            publisher: volumeInfo.publisher || '',
            publication_year: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : null,
            isbn: volumeInfo.industryIdentifiers ? 
                volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10')?.identifier : '',
            page_count: volumeInfo.pageCount || null,
            genre: volumeInfo.categories ? volumeInfo.categories[0] : '',
            cover_url: imageLinks.thumbnail || imageLinks.smallThumbnail || '',
            description: volumeInfo.description || ''
        };
    }

    async parseOpenLibraryBook(bookData, isbn) {
        let coverUrl = '';
        try {
            coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
            
            const checkCover = await axios.head(coverUrl).catch(() => null);
            if (!checkCover || checkCover.status !== 200) {
                coverUrl = bookData.covers && bookData.covers.length > 0 ? 
                    `https://covers.openlibrary.org/b/id/${bookData.covers[0]}-L.jpg` : '';
            }
        } catch (error) {
            coverUrl = '';
        }

        let authorName = '';
        if (bookData.authors && bookData.authors.length > 0) {
            try {
                const authorKey = bookData.authors[0].key || bookData.authors[0];
                const authorResponse = await axios.get(`${this.openLibraryAPI}${authorKey}.json`);
                authorName = authorResponse.data.name || '';
            } catch (error) {
                console.error('Error fetching author:', error);
            }
        }

        let publisherName = '';
        let publicationYear = null;
        if (bookData.publishers && bookData.publishers.length > 0) {
            publisherName = bookData.publishers[0];
        }
        if (bookData.publish_date) {
            const year = bookData.publish_date.match(/\d{4}/);
            if (year) {
                publicationYear = parseInt(year[0]);
            }
        }

        return {
            title: bookData.title || '',
            author: authorName,
            publisher: publisherName,
            publication_year: publicationYear,
            isbn: isbn,
            page_count: bookData.number_of_pages || null,
            genre: bookData.subjects ? bookData.subjects[0] : '',
            cover_url: coverUrl,
            description: bookData.description ? 
                (typeof bookData.description === 'string' ? bookData.description : bookData.description.value || '') : ''
        };
    }

    async getCoverFromISBN(isbn) {
        try {
            const cleanISBN = isbn.replace(/[-\s]/g, '');
            
            const googleResponse = await axios.get(`${this.googleBooksAPI}?q=isbn:${cleanISBN}`);
            if (googleResponse.data.items && googleResponse.data.items.length > 0) {
                const imageLinks = googleResponse.data.items[0].volumeInfo.imageLinks;
                if (imageLinks) {
                    return imageLinks.thumbnail || imageLinks.smallThumbnail || '';
                }
            }
            
            return `https://covers.openlibrary.org/b/isbn/${cleanISBN}-L.jpg`;
        } catch (error) {
            console.error('Error fetching cover:', error);
            return '';
        }
    }
}

module.exports = BookAPI;