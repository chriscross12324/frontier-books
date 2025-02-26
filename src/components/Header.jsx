import { FiShoppingCart } from "react-icons/fi";
import '../css/header.css'
import { useEffect, useState, useRef } from "react";

const Header = ({ cart }) => {
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
        <header className="header">
            <div>
                <div className="logo">Frontier Books</div>
                <nav>
                    <a href="/">Home</a>
                    <a href="/contact">Contact Us</a>
                </nav>
            </div>
            
            <div className="header-right">
                <div className="cart-container">
                    <button className="cart-button" onClick={toggleCart}>
                        <FiShoppingCart className="icon cart" />
                        <a className="cart-text" href="#">Cart 0</a>
                    </button>
                    
                    {isCartOpen && (
                        <div className="cart-dropdown">
                            <h3>Your Cart</h3>
                            {cart.length > 0 ? (
                                <ul>
                                    {cart.map((item, index) => (
                                        <li key={index}>
                                            <img src={item.image} alt={item.title} className="cart-item-image" />
                                            <span>{item.title} x{item.quantity}</span>
                                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Your cart is empty.</p>
                            )}
                        </div>
                    )}
                </div>
                
                <a href="/login" className="sign-in">Sign In</a>
            </div>

            {isCartOpen && <div className="overlay" onClick={() => setIsCartOpen(false)}></div>}
        </header>
    );
};

export default Header;