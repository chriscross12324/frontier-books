import styles from '../css/PageCheckout.module.css'
import { IoChevronBackOutline } from "react-icons/io5";
import CheckoutItem from "../components/CheckoutItem";

import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { CartContext } from "../services/CartContext";
import { useAuth } from '../services/AuthContext';
import { useNotification } from '../components/Notification';
import { useDialog } from '../services/DialogContext';

export default function Checkout() {
    const { cart } = useContext(CartContext);
    const { openDialogAlert } = useDialog();
    const { getValidAccessToken } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState("credit");
    const [paymentDetails, setPaymentDetails] = useState({});
    const [deliveryDetails, setDeliveryDetails]  = useState({});

    const navigate = useNavigate();

    const handleCheckout = async () => {
        console.log(cart.map(book => ({
            book_id: book.book_id,
            book_quantity: book.quantity
        })));
        
        //return;
        try {
            const response = await fetch('https://findthefrontier.ca/frontier_books/checkout', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getValidAccessToken()}`
                },
                body: JSON.stringify({ order_items: cart.map(book => ({
                    book_id: book.book_id,
                    book_quantity: book.quantity
                })),
                order_total_cost: (cart.reduce((sum, item) => sum + item.quantity * item.price, 0)).toFixed(2),
                order_payment_method: paymentMethod,
                order_payment_details: JSON.stringify(paymentDetails),
                order_delivery_address: JSON.stringify(deliveryDetails)
             })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);

                openDialogAlert({ 
                    dialogTitle: "Transaction Complete!",
                    dialogMessage: `We'll ship your order shortly. Here is your Order ID for reference: ${data['message']}`, 
                    onConfirm: () => {navigate("/");}
                });
            } else {
                openDialogAlert({ 
                    dialogTitle: "Transaction Failed",
                    dialogMessage: "An error occured while processing your order.", 
                });
            }
        } catch (err) {
            console.error("Checkout Error: ", err);
        }
    };

    const handlePaymentInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentDetails((prevData) => ({
            ...prevData,
            [name]: value
        }));
        console.log(paymentDetails);
    };

    const handleDeliveryInputChange = (e) => {
        const { name, value } = e.target;
        setDeliveryDetails((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }

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
                            <button className={styles.methodButton} onClick={() => {setPaymentMethod("credit"); setPaymentDetails({})}}>Credit Card</button>
                        </div>
                        <div className={`${styles.optionSelected} ${paymentMethod === "gift" ? styles.selected: styles.optionUnselected}`}>
                            <button className={styles.methodButton} onClick={() => {setPaymentMethod("gift"); setPaymentDetails({})}}>Gift Card</button>
                        </div>
                        
                    </div>
                    <h1 className={styles.sectionTitle}>Card Details</h1>
                    {paymentMethod === "credit" ? (
                        <div className={styles.infoLayout}>
                            <input className={styles.input} name='cardHolder' type='name' placeholder='Cardholder Name' onChange={handlePaymentInputChange}></input>
                            <input className={styles.input} name='cardNumber' type='number' placeholder='Credit Card Number' pattern='[0-9\s]{13,19}' maxLength='19' onChange={handlePaymentInputChange}></input>
                            <div className={styles.rowDiv}>
                                <input className={styles.input} name='cardExp' type='month' placeholder='MM/YYYY' onChange={handlePaymentInputChange}></input>
                                <input className={styles.input} name='cardCVV' type='number' placeholder='CVV' maxLength={3} onChange={handlePaymentInputChange}></input>
                            </div>
                            
                        </div>
                    ) : (
                        <div className={styles.infoLayout}>
                            <input className={styles.input} name='cardCode' type='text' placeholder='Gift Card Number' onChange={handlePaymentInputChange}></input>
                        </div>
                    )}
                    <h1 className={styles.sectionTitle}>Delivery Instructions</h1>
                    <div className={styles.infoLayout}>
                        <input className={styles.input} name='address_street' type='text' placeholder='Street Address' onChange={handleDeliveryInputChange}></input>
                        <input className={styles.input} name='address_city' type='text' placeholder='City' onChange={handleDeliveryInputChange}></input>
                        <div className={styles.rowDiv}>
                            <input className={styles.input} name='address_province' type='text' placeholder='Province' onChange={handleDeliveryInputChange}></input>
                            <input className={styles.input} name='address_postal_code' type='text' placeholder='Postal Code' pattern='^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$' onChange={handleDeliveryInputChange}></input>
                        </div>
                    </div>
                    <button className={styles.buttonCheckout} onClick={handleCheckout}>Place Order</button>
                </div>
                
                
            </div>
        </div>
    );
}