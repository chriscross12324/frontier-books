import { createContext, useState, useEffect, useContext, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useNotification } from "../components/Notification";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { showNotification } = useNotification();
    const { getValidAccessToken } = useAuth();
    const isCartSaved = useRef(true);
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
            return await data.cart_items;
        } catch (err) {
            console.error("Error fetching cart: ", err);
            return null;
        }
    }

    // --- Load Book Details from ID List ---
    const loadBookDetails = async (id_list) => {
        if (id_list.length <= 0) return null;
    
        try {
            const response = await fetch("https://findthefrontier.ca/frontier_books/books/details", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({int_list: id_list})
            });

            const book_details = await response.json();

            return book_details.books;

        } catch (err) {
            console.error("Error Fetching Book Details: ", err);
        }
    }

    // --- Load Local Cart from Remote ---
    const loadRemoteCart = async () => {
        try {
            // Check User is Logged In
            const accessToken = getValidAccessToken();
            if (!accessToken) return null;

            // Retrieve User's Cart from API
            const response = await fetch("https://findthefrontier.ca/frontier_books/cart", {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            // Check if Request was Successful
            if (response.status == 500) throw new Error("Fetch Unsuccessful");

            // Check if User's Cart Exists
            if (response.status != 200) throw new Error("Remote Cart is Empty: ", response.status);
            
            // Extract Cart Data
            const data = await response.json();

            const book_id_list = data.cart_items.map(book => book.book_id);

            const book_details = await loadBookDetails(book_id_list);

            const updated_book_details = book_details.map(book => ({
                ...book,
                quantity: data.cart_items.find(item => item.book_id === book.book_id)?.quantity || 0
            }));

            console.debug("Local Cart Datils: ", JSON.parse(localStorage.getItem("cart")) || { items: [], last_updated: 0 })
            console.debug("Loaded Book Details: ", updated_book_details);
            console.debug("Remote Cart Details: ", data.cart_items);

            setCart(updated_book_details);
        } catch (err) {
            console.error("Error fetching cart: ", err);
            return null;
        }
    }

    // --- Push Local Cart to Remote ---
    const saveLocalCart = async () => {
        console.debug("Saving Cart");

        // Check User is Logged In
        const accessToken = getValidAccessToken();
        if (!accessToken) return null;

        console.debug("User Authenticated");

        try {
            // Get Local Cart
            const localCart = JSON.parse(localStorage.getItem("cart")) || { items: [] };
            console.debug("Cart: ", localCart);

            // Ensure Cart Contains Items
            if (localCart.length <= 0) return null;
            console.debug("Cart Contains Items: ", localCart.length);

            // Push Local Cart to Remote
            const response = await fetch("https://findthefrontier.ca/frontier_books/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({ cart_items: localCart.map(book => ({
                    book_id: book.book_id,
                    book_quantity: book.quantity
                })) })
            });

            // Throw Error if Request Failed
            if (response.status != 200) throw new Error(response.statusText);

            isCartSaved.current = true;
            return;
        } catch (err) {
            console.error("Error saving cart: ", err);
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
        console.debug("Last Updated Remote Cart: ", remoteCart.last_updated);
        console.debug("Last Updated Local Cart: ", localCart.last_updated);
        if (!remoteCart) return;
        return;

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
        <CartContext.Provider value={{ cart, isCartSaved, syncCart, loadRemoteCart, saveLocalCart, addToCart, updateQuantity, removeItem }}>
            {children}
        </CartContext.Provider>
    );
};