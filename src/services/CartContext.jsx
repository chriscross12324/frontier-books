import { createContext, useState, useEffect, useContext, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useNotification } from "../components/Notification";
import { useDialog } from "../services/DialogContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { showNotification } = useNotification();
    const { isAuthenticated, getValidAccessToken } = useAuth();
    const { openDialogAlert, openDialogConfirm } = useDialog();
    const isCartSaved = useRef(true);
    const [cart, setCart] = useState([]);


    // --- Load Book Details from ID List ---
    const loadBookDetails = async (idList) => {
        if (idList.length <= 0) return null;
    
        try {
            const response = await fetch("https://findthefrontier.ca/frontier_books/books/details", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({int_list: idList})
            });

            const bookDetails = await response.json();

            return bookDetails.books;

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

            const bookIDList = data.cart_items.map(book => book.book_id);

            const bookDetails = await loadBookDetails(bookIDList);

            const updatedBookDetails = bookDetails.map(book => ({
                ...book,
                quantity: data.cart_items.find(item => item.book_id === book.book_id)?.quantity || 0
            }));

            setCart(updatedBookDetails);
        } catch (err) {
            console.error("Error fetching cart: ", err);
            return null;
        }
    }

    // --- Push Local Cart to Remote ---
    const saveLocalCart = async () => {
        // Check User is Logged In
        const accessToken = getValidAccessToken();
        if (!accessToken) return null;

        try {
            // Get Local Cart
            const localCart = JSON.parse(localStorage.getItem("cart")) || { items: [] };

            // Ensure Cart Contains Items
            //if (localCart.length <= 0) return null;

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
            showNotification("Cart Saved!");
            return;
        } catch (err) {
            console.error("Error saving cart: ", err);
            return null;
        }
    }

    // --- Load Cart from LocalStorage on Mount ---
    useEffect(() => {
        if (isAuthenticated) loadRemoteCart();
    }, []);

    // --- Save Cart to LocalStorage on Change ---
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (book) => {
        const accessToken = getValidAccessToken();
        if (!accessToken) return null;

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
        const accessToken = getValidAccessToken();
        if (!accessToken) return null;

        if (newQuantity <= 0) {
            removeItem(id);
            return;
        }

        setCart((prevCart) => prevCart.map(item =>
            item.title === id ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeItem = (id) => {
        const accessToken = getValidAccessToken();
        if (!accessToken) return null;
        openDialogConfirm({ 
            dialogTitle: "Remove from Cart?", 
            dialogMessage: "This will remove the item from your cart. Continue?", 
            onConfirm: () => {
                setCart((prevCart) => prevCart.filter(item => item.title !== id));
            } 
        });
    };

    return (
        <CartContext.Provider value={{ cart, isCartSaved, loadRemoteCart, saveLocalCart, addToCart, updateQuantity, removeItem }}>
            {children}
        </CartContext.Provider>
    );
};