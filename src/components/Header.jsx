import { FiShoppingCart, FiTrash2 } from "react-icons/fi";
import styles from '../css/header.module.css'
import { useEffect, useState, useRef, useContext } from "react";
import CartItem from "./CartItem";
import { CartContext } from "../services/CartContext";

const Header = () => {
    const { cart } = useContext(CartContext);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const cartRef = useRef(null);

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cartRef.current && !cartRef.current.contains(event.target)) {
                setIsCartOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isCartOpen]);

    return (
        <header className={styles.header}>
            <div className={styles.header_left}>
                <div className={styles.logo}>Frontier Books</div>
                <nav>
                    <a href="/">Home</a>
                    <a href="/contact">Contact Us</a>
                </nav>
            </div>
            
            <div className={styles.header_right}>
                <div className={styles.cart_container}>
                    <button className={styles.cart_button} onClick={toggleCart}>
                        <FiShoppingCart className={styles.icon} />
                        <a className={styles.cart_text} href="#">Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</a>
                    </button>
                    
                    {isCartOpen && (
                        <div className={styles.cart_dropdown}>
                            <h3>My Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</h3>
                            {cart.length > 0 ? (
                                <ul>
                                    {cart.map((item, index) => (
                                        <li key={index}>
                                            <CartItem cartItem={item} />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Your cart is empty.</p>
                            )}
                        </div>
                    )}
                </div>
                
                <a href="/login" className={styles.sign_in}>Sign In</a>
            </div>

            {isCartOpen && <div className={styles.overlay} onClick={() => setIsCartOpen(false)}></div>}
        </header>
    );
};

export default Header;