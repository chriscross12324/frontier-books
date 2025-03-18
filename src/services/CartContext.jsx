import { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";
import { useNotification } from "../components/Notification";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { showNotification } = useNotification();
    const { getValidAccessToken } = useAuth();
    const [cart, setCart] = useState([]);

    // --- Fetch User Cart from API ---
    const fetchRemoteCart = async () => {
        try {
            const access_token = getValidAccessToken();
            if (!access_token) return null;

            console.error("Using Token: ", access_token);
            const response = await fetch("https://findthefrontier.ca/frontier_books/cart", {
                headers: { Authorization: `Bearer ${access_token}` }
            });

            // Return 204 if Cart Doesn't Exist
            if (response.status == 204) return 204;
            

            if (response.status != 200) throw new Error(response.statusText);
            
            const data = await response.json();

            console.debug("Remote Cart: ", data.cart_items);
            //return await response.json();
            return null;
        } catch (err) {
            console.error("Error fetching cart: ", err);
            return null;
        }
    }

    // --- Sync the Local and Remote Cart ---
    const syncCart = async () => {
        const access_token = getValidAccessToken();
        if (!access_token) return null;
        
        const localCart = JSON.parse(localStorage.getItem("cart")) || { items: [], last_updated: 0 };
        const remoteCart = await fetchRemoteCart();

        console.debug("Local Cart: ", localCart);
        if (!remoteCart) return;

        if (remoteCart === 204 || localCart.last_updated > remoteCart.last_updated) {
            // Local Cart is Newer, Replace Remote Copy
            await fetch("https://findthefrontier.ca/frontier_books/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${access_token}`
                },
                body: JSON.stringify({cart_items: localCart.map(book => ({
                    book_id: book.book_id,
                    book_quantity: book.quantity
                }))
            })
            });
        } else {
            // Remote Cart is Newer, Replace Local Copy
            localStorage.setItem("cart", JSON.stringify(remoteCart));
            console.warn("Uh oh...");
            setCart(remoteCart);
        }
    }

    // --- Load Cart from LocalStorage on Mount ---
    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(storedCart);
    }, []);

    // --- Save Cart to LocalStorage on Change ---
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // --- Manually Trigger Local/Remote Cart Sync ---
    const triggerCartSync = () => syncCart();

    // --- Automatically Trigger Local/Remote Cart Sync on Reload ---
    useEffect(() => {
        window.addEventListener("beforeunload", triggerCartSync);
        return () => window.removeEventListener("beforeunload", triggerCartSync);
    }, [cart]);

    const addToCart = (book) => {
        const access_token = getValidAccessToken();
        if (!access_token) return null;

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

        showNotification("Added to cart!");
    };

    const updateQuantity = (id, newQuantity) => {
        const access_token = getValidAccessToken();
        if (!access_token) return null;

        if (newQuantity <= 0) {
            removeItem(id);
            return;
        }

        setCart((prevCart) => prevCart.map(item =>
            item.title === id ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeItem = (id) => {
        const access_token = getValidAccessToken();
        if (!access_token) return null;

        if (confirm("Are you sure you want to remove this item?")) {
            setCart((prevCart) => prevCart.filter(item => item.title !== id));
        }
    };

    return (
        <CartContext.Provider value={{ cart, syncCart, addToCart, updateQuantity, removeItem }}>
            {children}
        </CartContext.Provider>
    );
};