import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { food_list as defaultFoodList } from "../assets/assets";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

    const [cartItems, setCartItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("quickbites_cart")) || {};
        } catch (e) {
            return {};
        }
    });
    const [token, setToken] = useState(() => localStorage.getItem("token") || "");
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("quickbites_user")) || null;
        } catch (e) {
            return null;
        }
    });

    const [deliveryAddress, setDeliveryAddress] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("quickbites_address")) || {
                firstName: "",
                lastName: "",
                email: "",
                street: "",
                city: "",
                state: "",
                zipcode: "",
                country: "India",
                phone: ""
            };
        } catch (e) {
            return {
                firstName: "",
                lastName: "",
                email: "",
                street: "",
                city: "",
                state: "",
                zipcode: "",
                country: "India",
                phone: ""
            };
        }
    });

    const [food_list, setFoodList] = useState(defaultFoodList || []);
    const [promoCode, setPromoCode] = useState("");
    const [discount, setDiscount] = useState(0);

    const defaultLocation = {
        city: "Delhi NCR",
        area: "Connaught Place / Sector 18",
        state: "Delhi",
        pincode: "110001",
        hubName: "QuickBites Delhi NCR Mega Hub",
        hubLandmark: "Inner Circle & Sector 18 Dark Store",
        deliveryTime: "10-15 mins",
        latitude: 28.6139,
        longitude: 77.2090
    };

    const [currentLocation, setCurrentLocation] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("quickbites_location")) || defaultLocation;
        } catch (e) {
            return defaultLocation;
        }
    });

    const [isDetectingGPS, setIsDetectingGPS] = useState(false);

    const selectLocation = (hub) => {
        setCurrentLocation(hub);
        try {
            localStorage.setItem("quickbites_location", JSON.stringify(hub));
        } catch (e) {}

        // Automatically update delivery address city & state so PlaceOrder reflects the chosen hub
        updateDeliveryAddress({
            city: hub.city,
            state: hub.state,
            zipcode: hub.pincode
        });
    };

    // Live GPS Detection via HTML5 Geolocation API
    const detectGPSLocation = async () => {
        if (!navigator.geolocation) {
            alert("⚠️ Geolocation is not supported by your browser. Please select your city manually.");
            return;
        }

        setIsDetectingGPS(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Try reverse geocoding with OpenStreetMap Nominatim
                    const res = await axios.get(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
                        { timeout: 4000 }
                    );

                    let detectedCity = "Delhi NCR";
                    let detectedArea = "Detected Live Location";
                    let detectedState = "Delhi";
                    let detectedPincode = "110001";

                    if (res.data && res.data.address) {
                        const addr = res.data.address;
                        detectedCity = addr.city || addr.town || addr.village || addr.county || addr.state_district || "Delhi NCR";
                        detectedArea = addr.suburb || addr.neighbourhood || addr.road || "Live Location";
                        detectedState = addr.state || "India";
                        detectedPincode = addr.postcode || "110001";
                    }

                    // Check if detected city matches or is close to Mirzapur, Delhi, etc.
                    const isMirzapur = detectedCity.toLowerCase().includes("mirzapur") || 
                                       detectedArea.toLowerCase().includes("mirzapur");

                    const newHub = {
                        city: isMirzapur ? "Mirzapur" : detectedCity,
                        area: detectedArea,
                        state: detectedState,
                        pincode: detectedPincode,
                        hubName: isMirzapur ? "QuickBites Mirzapur Express Hub" : `QuickBites ${detectedCity} Cloud Hub`,
                        hubLandmark: `Near ${detectedArea} Local Outlet`,
                        deliveryTime: "12-18 mins",
                        latitude: latitude,
                        longitude: longitude,
                        isGPSDetected: true
                    };

                    selectLocation(newHub);
                } catch (apiErr) {
                    // Fallback using latitude/longitude proximity:
                    // Mirzapur approx: lat 25.13, lon 82.56
                    const distToMirzapur = Math.sqrt(Math.pow(latitude - 25.13, 2) + Math.pow(longitude - 82.56, 2));
                    const distToDelhi = Math.sqrt(Math.pow(latitude - 28.61, 2) + Math.pow(longitude - 77.20, 2));

                    if (distToMirzapur < distToDelhi) {
                        selectLocation({
                            city: "Mirzapur",
                            area: "Civil Lines / Station Road",
                            state: "Uttar Pradesh",
                            pincode: "231001",
                            hubName: "QuickBites Mirzapur Express Hub",
                            hubLandmark: "Near Station Road, Civil Lines",
                            deliveryTime: "15-20 mins",
                            latitude: latitude,
                            longitude: longitude,
                            isGPSDetected: true
                        });
                    } else {
                        selectLocation({
                            city: "Delhi NCR",
                            area: "Live GPS Location",
                            state: "Delhi",
                            pincode: "110001",
                            hubName: "QuickBites Delhi NCR Mega Hub",
                            hubLandmark: "Connaught Place / Sector 18 Dark Store",
                            deliveryTime: "10-15 mins",
                            latitude: latitude,
                            longitude: longitude,
                            isGPSDetected: true
                        });
                    }
                } finally {
                    setIsDetectingGPS(false);
                }
            },
            (error) => {
                setIsDetectingGPS(false);
                console.warn("GPS Geolocation error:", error.message);
                alert("📍 Location permission was denied or unavailable. Please pick your city from the list.");
            },
            { timeout: 7000, enableHighAccuracy: true }
        );
    };

    const updateDeliveryAddress = (newAddr) => {
        setDeliveryAddress((prev) => {
            const updated = { ...prev, ...newAddr };
            localStorage.setItem("quickbites_address", JSON.stringify(updated));
            return updated;
        });
    };

    const loginUser = (userToken, userData) => {
        setToken(userToken);
        localStorage.setItem("token", userToken);
        if (userData) {
            setUser(userData);
            localStorage.setItem("quickbites_user", JSON.stringify(userData));
            if (userData.name) {
                const parts = userData.name.trim().split(" ");
                updateDeliveryAddress({
                    firstName: parts[0] || "",
                    lastName: parts.slice(1).join(" ") || "",
                    email: userData.email || ""
                });
            }
        }
    };

    useEffect(() => {
        try {
            localStorage.setItem("quickbites_cart", JSON.stringify(cartItems));
        } catch (e) {}
    }, [cartItems]);

    const logoutUser = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("quickbites_user");
        localStorage.removeItem("quickbites_cart");
        setToken("");
        setUser(null);
        setCartItems({});
    };

    const addToCart = async (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
        }));
        if (token && url && !token.startsWith("quickbites_local_")) {
            try {
                await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
            } catch (e) {
                console.warn("Cart sync notice:", e.message);
            }
        }
    };

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => {
            const next = { ...prev };
            if (next[itemId] > 1) {
                next[itemId] -= 1;
            } else {
                delete next[itemId];
            }
            return next;
        });
        if (token && url && !token.startsWith("quickbites_local_")) {
            try {
                await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
            } catch (e) {
                console.warn("Cart remove notice:", e.message);
            }
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                if (itemInfo && itemInfo.price) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    const getTotalItemsCount = () => {
        let count = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                count += cartItems[item];
            }
        }
        return count;
    };

    const applyPromo = (code) => {
        const cleanCode = code.trim().toUpperCase();
        const subtotal = getTotalCartAmount();
        if (subtotal === 0) {
            return { success: false, message: "Cart is empty" };
        }
        if (cleanCode === "WELCOME50") {
            const disc = Math.min(Math.round(subtotal * 0.5), 100);
            setDiscount(disc);
            setPromoCode("WELCOME50");
            return { success: true, message: `🎉 WELCOME50 applied! You saved ₹${disc}` };
        } else if (cleanCode === "TASTY10") {
            const disc = Math.min(40, subtotal);
            setDiscount(disc);
            setPromoCode("TASTY10");
            return { success: true, message: `🎉 TASTY10 applied! You saved ₹${disc}` };
        } else if (cleanCode === "FREESHIP") {
            setDiscount(40);
            setPromoCode("FREESHIP");
            return { success: true, message: "🚚 FREESHIP applied! Free Delivery on this order" };
        } else if (cleanCode === "FOODIE20") {
            const disc = Math.round(subtotal * 0.2);
            setDiscount(disc);
            setPromoCode("FOODIE20");
            return { success: true, message: `🎉 FOODIE20 applied! You saved ₹${disc}` };
        } else {
            return { success: false, message: "❌ Invalid Promo Code. Try WELCOME50 or TASTY10" };
        }
    };

    const removePromo = () => {
        setDiscount(0);
        setPromoCode("");
    };

    const fetchFoodList = async () => {
        try {
            const response = await axios.get(url + "/api/food/list");
            if (response.data && response.data.data) {
                setFoodList(response.data.data);
            }
        } catch (e) {
            console.warn("Could not fetch food list from API:", e.message);
        }
    };

    const loadCartData = async (activeToken) => {
        try {
            const response = await axios.post(url + "/api/cart/get", {}, { headers: { token: activeToken } });
            if (response.data && response.data.cartData) {
                setCartItems(response.data.cartData);
            }
        } catch (e) {
            console.warn("Could not load cart data:", e.message);
        }
    };

    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            const savedToken = localStorage.getItem("token");
            if (savedToken) {
                setToken(savedToken);
                await loadCartData(savedToken);
                // Refresh profile data in background
                try {
                    const profileRes = await axios.get(url + "/api/user/profile", { headers: { token: savedToken } });
                    if (profileRes.data && profileRes.data.success && profileRes.data.data) {
                        setUser(profileRes.data.data);
                        localStorage.setItem("quickbites_user", JSON.stringify(profileRes.data.data));
                    }
                } catch (err) {
                    console.log("Profile refresh notice:", err.message);
                }
            }
        }
        loadData();
    }, []);

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        getTotalItemsCount,
        url,
        token,
        setToken,
        user,
        setUser,
        loginUser,
        logoutUser,
        deliveryAddress,
        updateDeliveryAddress,
        promoCode,
        discount,
        applyPromo,
        removePromo,
        currentLocation,
        setCurrentLocation,
        selectLocation,
        detectGPSLocation,
        isDetectingGPS
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;