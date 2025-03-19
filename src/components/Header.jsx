import { IoClose, IoCartOutline } from "react-icons/io5";
import styles from '../css/Header.module.css'
import { useEffect, useState, useRef, useContext } from "react";
import CartItem from "./CartItem";
import { CartContext } from "../services/CartContext";
import { useAuth } from "../services/AuthContext"
import { Link } from "react-router";

const Header = () => {
    const { cart, isCartSaved, syncCart, loadRemoteCart, saveLocalCart } = useContext(CartContext);
    const { user, logout } = useAuth();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const hasCartUpdatedRef = useRef(false);
    const cartRef = useRef(null);

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    return (
        <header className={styles.header}>
            <div className={styles.header_left}>
                <div className={styles.logo}>Frontier Books</div>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/contact">Contact Us</Link>
                </nav>
            </div>

            {user ? (
                <div className={styles.header_right}>
                    <div className={styles.cart_container}>
                        <button className={styles.cart_button} onClick={toggleCart}>
                            <IoCartOutline className={styles.icon} />
                            <Link className={styles.cart_text}>Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)}){isCartSaved.current ? "" : "*"}</Link>
                        </button>
                        
                        {isCartOpen && (
                            <div className={styles.cart_dropdown}>
                                <div className={styles.cart_header}>
                                    <h3 className={styles.cart_title}>My Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)}){isCartSaved.current ? "" : "*"}</h3>
                                    <button className={styles.button_close_cart} onClick={() => {toggleCart(); loadRemoteCart();}}>
                                        <IoClose className={styles.icon_close_cart}/>
                                    </button>
                                </div>
                                {cart.length > 0 ? (
                                    <ul className={styles.list_cart}>
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
                                {cart.length > 0 && <button className={styles.button_checkout} onClick={() => {location.href="/checkout"}}>Checkout (${(cart.reduce((sum, item) => sum + item.quantity * item.price, 0)).toFixed(2)})</button>}
                            </div>
                        )}
                    </div>
                    
                    <Link to="/" className={styles.sign_in} onClick={logout}>Account</Link>
                </div>
            ) : (
                <Link to="/login">Sign In</Link>
            )}
            
            

            {isCartOpen && <div className={styles.overlay} onClick={() => {toggleCart(); saveLocalCart();}}></div>}
        </header>
    );
};

export default Header;