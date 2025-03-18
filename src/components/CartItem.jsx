import { useContext } from "react";
import { IoAdd, IoRemove, IoTrashOutline } from "react-icons/io5";
import { CartContext } from "../services/CartContext";
import styles from '../css/CartItem.module.css'

export default function CartItem({ cartItem, hasCartUpdatedRef }) {
    const { updateQuantity, removeItem } = useContext(CartContext);

    return (
        <div className={styles.item_card}>
            <img src={cartItem.cover_image_url} alt={cartItem.title} className={styles.item_image} />
            <div className={styles.item_footer}>
                <div>
                    <h2 className={styles.item_author}>
                        {cartItem.author}
                    </h2>
                    <h2 className={styles.item_title}>
                        {cartItem.title}
                    </h2>
                </div>
                
                <div className={styles.quantity_pricing}>
                    <div className={styles.quantity_controls}>
                        <button className={styles.button_change_quantity} onClick={() => {updateQuantity(cartItem.title, cartItem.quantity - 1); hasCartUpdatedRef.current = true;}}><IoRemove className={styles.icon_change_quantity}/></button>
                        <input type="text" className={styles.item_quantity} value={cartItem.quantity} min="1" disabled></input>
                        <button className={styles.button_change_quantity} onClick={() => {updateQuantity(cartItem.title, cartItem.quantity + 1); hasCartUpdatedRef.current = true;}}><IoAdd className={styles.icon_change_quantity}/></button>
                        <button className={styles.remove_button} onClick={() => {removeItem(cartItem.title); hasCartUpdatedRef.current = true;}}><IoTrashOutline /></button>
                    </div>
                    <p className={styles.item_price}>${(cartItem.price * cartItem.quantity).toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
}
