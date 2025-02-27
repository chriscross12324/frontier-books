import { useContext } from "react";
import { FiTrash2 } from "react-icons/fi";
import { CartContext } from "../services/CartContext";
import styles from '../css/cart-item.module.css'

export default function CartItem({ cartItem }) {
    const { updateQuantity, removeItem } = useContext(CartContext);

    return (
        <div className={styles.item_card}>
            <img src={cartItem.image} alt={cartItem.title} className={styles.item_image} />
            <div className={styles.item_footer}>
                <div>
                    <h2 className={styles.item_author}>
                        Author
                    </h2>
                    <h2 className={styles.item_title}>
                        {cartItem.title}
                    </h2>
                </div>
                
                <div className={styles.quantity_pricing}>
                    <div className={styles.quantity_controls}>
                        <button className={styles.decrease_quantity_button} onClick={() => updateQuantity(cartItem.title, cartItem.quantity - 1)}>-</button>
                        <input type="text" className={styles.item_quantity} value={cartItem.quantity} min="1"></input>
                        <button className={styles.increase_quantity_button} onClick={() => updateQuantity(cartItem.title, cartItem.quantity + 1)}>+</button>
                    </div>
                    <p className={styles.item_price}>${(cartItem.price * cartItem.quantity).toFixed(2)}</p>
                </div>
                <button class={styles.remove_button} onClick={() => removeItem(cartItem.title)}><FiTrash2 /></button>
            </div>
        </div>
    );
}