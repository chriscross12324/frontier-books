import styles from '../css/CheckoutItem.module.css'

export default function CartItem({ cartItem }) {

    return (
        <div className={styles.itemCard}>
            <img src={cartItem.cover_image_url} alt={cartItem.title} className={styles.itemImage} />
            <div className={styles.itemFooter}>
                <div className={styles.divBookInfo}>
                    <h2 className={styles.itemTitle}>
                        {cartItem.title}
                    </h2>
                    <h2 className={styles.itemAuthor}>
                        {cartItem.author}
                    </h2>
                </div>
                
                <div className={styles.quantityPricing}>
                    <p className={styles.itemQuantity}>Qty: {cartItem.quantity}</p>
                    <p className={styles.itemPrice}>Price: ${(cartItem.price * cartItem.quantity).toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
}
