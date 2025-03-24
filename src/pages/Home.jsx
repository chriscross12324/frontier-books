import Header from "../components/Header"
import BooksGrid from "../components/BooksGrid"
import { useEffect, useState } from "react";

const HomePage = () => {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);

    useEffect(() => {
            fetch("https://findthefrontier.ca/frontier_books/books")
                .then(response => response.json())
                .then(data => {
                    console.log("API Response: ", data);
                    setBooks(data.books || []);
                    setFilteredBooks(data.books || []);
                })
                .catch(error => console.error("Failed to fetch books: ", error));
        }, []);

    return (
        <div className="main">
            <Header books={books} setFilteredBooks={setFilteredBooks} />
            <BooksGrid books={filteredBooks} />
        </div>
    );
}

export default HomePage;