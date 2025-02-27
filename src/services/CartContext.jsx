import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(storedCart);
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (book) => {
        setCart((prevCart) => {
            const updatedCart = [...prevCart];
            const existingItem = updatedCart.find((item) => item.title === book.title);

            if (existingItem) {
                existingItem.quantity++;
            } else {
                updatedCart.push({ ...book, quantity: 1 });
            }
            return updatedCart;
        });
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity === 0) {
            removeItem(id);
        }

        setCart((prevCart) => prevCart.map(item =>
            item.title === id ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeItem = (id) => {
        if (confirm("Are you sure you want to remove this item?")) {
            setCart((prevCart) => prevCart.filter(item => item.title !== id));
        }
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeItem }}>
            {children}
        </CartContext.Provider>
    );
};