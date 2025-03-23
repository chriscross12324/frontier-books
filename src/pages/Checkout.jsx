import styles from '../css/PageCheckout.module.css'
import { IoChevronBackOutline } from "react-icons/io5";
import CheckoutItem from "../components/CheckoutItem";

import { useContext } from "react";
import { useNavigate } from "react-router";
import { CartContext } from "../services/CartContext";

export default function Checkout() {
    const { cart } = useContext(CartContext);

    const navigate = useNavigate();

    return (
        <div className={styles.pageRootLayout}>
            <div className={styles.rowLayout}>
                <div className={styles.itemsLayout}>
                    <div className={styles.navigationHeader}>
                        <button className={styles.buttonClose} onClick={() => {navigate('/')}}>
                            <IoChevronBackOutline className={styles.iconClose} />
                        </button>
                        <h2 className={styles.navigationText}>Back</h2>
                    </div>
                    {cart.length > 0 ? (
                        <ul className={styles.listCart}>
                            {cart.map((item, index) => (
                                <li key={index}>
                                    <CheckoutItem cartItem={item} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={styles.cart_empty_container}>
                            <p className={styles.empty_cart_text}>Your cart is empty.</p>
                        </div>
                    )}
                </div>
                <div className={styles.paymentLayout}>
                    <h1>Card Details</h1>
                    <input type='name' placeholder='Cardholder Name'></input>
                    <input type='number' placeholder='Credit Card Number'></input>
                    <input type='month' ></input>
                    <input type='number' placeholder='CSV' maxLength={3}></input>
                </div>
            </div>
        </div>
    );
}