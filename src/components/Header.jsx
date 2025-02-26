import { FiShoppingCart } from "react-icons/fi";
import '../css/header.css'

const Header = () => {
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
                    <FiShoppingCart className="icon cart" />
                    <a className="cart-text" href="#">Cart 0</a>
                </div>
                
                <a href="/login" className="sign-in">Sign In</a>
            </div>
        </header>
    );
};

export default Header;