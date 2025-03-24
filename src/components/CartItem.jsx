import { useContext } from "react";
import { IoAdd, IoRemove, IoTrashOutline } from "react-icons/io5";
import { CartContext } from "../services/CartContext";
import styles from '../css/CartItem.module.css'

export default function CartItem({ cartItem }) {
    const { isCartSaved, updateQuantity, removeItem } = useContext(CartContext);

    return (
        <div className={styles.itemCard}>
            <img src={cartItem.cover_image_url} alt={cartItem.title} className={styles.itemImage} />
            <div className={styles.itemFooter}>
                <div>
                    <h2 className={styles.itemAuthor}>
                        {cartItem.author}
                    </h2>
                    <h2 className={styles.itemTitle}>
                        {cartItem.title}
                    </h2>
                </div>
                
                <div className={styles.quantityPricing}>
                    <div className={styles.quantityControls}>
                        <button className={styles.buttonChangeQuantity} onClick={() => {updateQuantity(cartItem.title, cartItem.quantity - 1); isCartSaved.current = false;}}><IoRemove className={styles.iconChangeQuantity}/></button>
                        <input type="text" className={styles.itemQuantity} value={cartItem.quantity} min="1" disabled></input>
                        <button className={styles.buttonChangeQuantity} onClick={() => {updateQuantity(cartItem.title, cartItem.quantity + 1); isCartSaved.current = false;}}><IoAdd className={styles.iconChangeQuantity}/></button>
                        <button className={styles.buttonRemoveItem} onClick={() => {removeItem(cartItem.title); isCartSaved.current = false;}}><IoTrashOutline /></button>
                    </div>
                    <p className={styles.itemPrice}>${(cartItem.price * cartItem.quantity).toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
}
