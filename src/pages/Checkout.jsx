import styles from '../css/PageCheckout.module.css'
import { IoChevronBackOutline } from "react-icons/io5";
import CheckoutItem from "../components/CheckoutItem";

import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { CartContext } from "../services/CartContext";

export default function Checkout() {
    const { cart } = useContext(CartContext);
    const [paymentMethod, setPaymentMethod] = useState("credit");

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
                    <h1 className={styles.sectionTitle}>Payment Method</h1>
                    <div className={styles.methodLayout}>
                        <div className={`${styles.optionSelected} ${paymentMethod === "credit" ? styles.selected: styles.optionUnselected}`}>
                            <button className={styles.methodButton} onClick={() => setPaymentMethod("credit")}>Credit Card</button>
                        </div>
                        <div className={`${styles.optionSelected} ${paymentMethod === "gift" ? styles.selected: styles.optionUnselected}`}>
                            <button className={styles.methodButton} onClick={() => setPaymentMethod("gift")}>Gift Card</button>
                        </div>
                        
                    </div>
                    <h1 className={styles.sectionTitle}>Card Details</h1>
                    {paymentMethod === "credit" ? (
                        <div className={styles.infoLayout}>
                            <input className={styles.input} type='name' placeholder='Cardholder Name'></input>
                            <input className={styles.input} type='number' placeholder='Credit Card Number' pattern='[0-9\s]{13,19}' maxLength='19'></input>
                            <div className={styles.rowDiv}>
                                <input className={styles.input} type='month' placeholder='MM/YYYY'></input>
                                <input className={styles.input} type='number' placeholder='CVV' maxLength={3}></input>
                            </div>
                            
                        </div>
                    ) : (
                        <div className={styles.infoLayout}>
                            <input className={styles.input} type='number' placeholder='Gift Card Number'></input>
                        </div>
                    )}
                    <h1 className={styles.sectionTitle}>Delivery Instructions</h1>
                    <div className={styles.infoLayout}>
                        <input className={styles.input} type='text' placeholder='Street Address'></input>
                        <input className={styles.input} type='text' placeholder='City'></input>
                        <div className={styles.rowDiv}>
                            <input className={styles.input} type='text' placeholder='Province'></input>
                            <input className={styles.input} type='text' placeholder='Postal Code' pattern='^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$'></input>
                        </div>
                    </div>
                    <button className={styles.buttonCheckout}>Place Order</button>
                </div>
                
                
            </div>
        </div>
    );
}