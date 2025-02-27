import { IoClose, IoCartOutline } from "react-icons/io5";
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
                        <IoCartOutline className={styles.icon} />
                        <a className={styles.cart_text} href="#">Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</a>
                    </button>
                    
                    {isCartOpen && (
                        <div className={styles.cart_dropdown}>
                            <div className={styles.cart_header}>
                                <h3 className={styles.cart_title}>My Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</h3>
                                <button className={styles.button_close_cart} onClick={() => setIsCartOpen(false)}>
                                    <IoClose className={styles.icon_close_cart}/>
                                </button>
                            </div>
                            {cart.length > 0 ? (
                                <ul>
                                    {cart.map((item, index) => (
                                        <li key={index}>
                                            <CartItem cartItem={item} />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className={styles.cart_empty_container}>
                                    <p className={styles.empty_cart_text}>Your cart is empty.</p>
                                </div>
                            )}
                            {cart.length > 0 && <button className={styles.button_checkout}>Checkout (${(cart.reduce((sum, item) => sum + item.quantity * item.price, 0)).toFixed(2)})</button>}
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