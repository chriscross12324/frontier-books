import { IoClose, IoCartOutline } from "react-icons/io5";
import styles from '../css/Header.module.css'
import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router";
import CartItem from "./CartItem";
import { CartContext } from "../services/CartContext";
import { useAuth } from "../services/AuthContext"
import { Link } from "react-router";

const Header = ({ books, setFilteredBooks }) => {
    const { cart, isCartSaved, saveLocalCart } = useContext(CartContext);
    const { isAuthenticated, isUserAdmin } = useAuth();

    const [searchTerm, setSearchTerm] = useState("");
    const [isCartOpen, setIsCartOpen] = useState(false);

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const navigate = useNavigate();

    useEffect(() => {
        if (searchTerm === "") {
            setFilteredBooks(books);
        } else {
            const lowerCaseSearch = searchTerm.toLowerCase();
            const priceExactMatch = lowerCaseSearch.match(/^\$(\d+\.?\d*)$/);
            const priceRangeMatch = lowerCaseSearch.match(/^\$(\d+\.?\d*)-\$(\d+\.?\d*)$/);
            const priceLessThanMatch = lowerCaseSearch.match(/^<\$(\d+\.?\d*)$/);
            const priceGreaterThanMatch = lowerCaseSearch.match(/^>\$(\d+\.?\d*)$/);

            const filteredBooks = books.filter(book =>
                book.title.toLowerCase().includes(lowerCaseSearch) ||
                book.author.toLowerCase().includes(lowerCaseSearch) ||
                book.description.toLowerCase().includes(lowerCaseSearch) ||
                (priceExactMatch && book.price === parseFloat(priceExactMatch[1])) ||
                (priceRangeMatch && book.price >= parseFloat(priceRangeMatch[1]) && book.price <= parseFloat(priceRangeMatch[2])) ||
                (priceLessThanMatch && book.price < parseFloat(priceLessThanMatch[1])) ||
                (priceGreaterThanMatch && book.price > parseFloat(priceGreaterThanMatch[1]))
            );

            setFilteredBooks(filteredBooks);
        }
    }, [searchTerm, books]);

    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <div className={styles.headerLogo}>Frontier Books</div>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/contact">Contact Us</Link>
                </nav>
            </div>

            <input className={styles.searchInput} type="search" placeholder="Search..." onChange={(e) => setSearchTerm(e.target.value)}/>

            {isAuthenticated ? (
                <div className={styles.headerRight}>
                    <div className={styles.cartButtonContainer}>
                        <button className={styles.cartButton} onClick={toggleCart}>
                            <IoCartOutline className={styles.cartButtonIcon} />
                            <Link className={styles.cartButtonText}>Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)}){isCartSaved.current ? "" : "*"}</Link>
                        </button>
                        
                        {isCartOpen && (
                            <div className={styles.cartDropdown}>
                                <div className={styles.cartHeader}>
                                    <h3 className={styles.cartTitle}>My Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)}){isCartSaved.current ? "" : "*"}</h3>
                                    <button className={styles.buttonCloseCart} onClick={() => {toggleCart(); saveLocalCart();}}>
                                        <IoClose className={styles.iconCloseCart}/>
                                    </button>
                                </div>
                                {cart.length > 0 ? (
                                    <ul className={styles.listCartItems}>
                                        {cart.map((item, index) => (
                                            <li key={index}>
                                                <CartItem cartItem={item} />
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className={styles.cartEmptyContainer}>
                                        <p className={styles.cartEmptyText}>Your cart is empty.</p>
                                    </div>
                                )}
                                {cart.length > 0 && <button className={styles.buttonCheckout} onClick={() => {navigate("/checkout")}}>Checkout (${(cart.reduce((sum, item) => sum + item.quantity * item.price, 0)).toFixed(2)})</button>}
                            </div>
                        )}
                    </div>

                    {isUserAdmin && (<Link to="/admin" className={styles.sign_in}>Admin Dashboard</Link>)}
                    <Link to="/user" className={styles.sign_in}>Account</Link>
                </div>
            ) : (
                <Link to="/login">Sign In</Link>
            )}
            
            

            {isCartOpen && <div className={styles.overlay} onClick={() => {toggleCart(); saveLocalCart();}}></div>}
        </header>
    );
};

export default Header;