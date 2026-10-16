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
    const [cartRestaurant, setCartRestaurant] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("quickbites_cart_restaurant")) || null;
        } catch (e) {
            return null;
        }
    });

    const [customThalis, setCustomThalis] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("quickbites_thalis")) || [];
        } catch (e) {
            return [];
        }
    });

    const [cartConflict, setCartConflict] = useState({
        isOpen: false,
        pendingItemId: null,
        pendingThali: null,
        oldName: "",
        newName: ""
    });

    const [restaurants, setRestaurants] = useState([]);
    const [favorites, setFavorites] = useState({ foods: [], restaurants: [] });

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
    const detectGPSLocation = async (opts = {}) => {
        const { isAuto = false, silent = false } = opts;
        if (!navigator.geolocation) {
            if (!silent && !isAuto) {
                alert("⚠️ Geolocation is not supported by your browser. Please select your city manually.");
            }
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
                        detectedArea = addr.suburb || addr.neighbourhood || addr.road || addr.residential || "Live Location";
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
                        isGPSDetected: true,
                        detectedAt: Date.now()
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
                            isGPSDetected: true,
                            detectedAt: Date.now()
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
                            isGPSDetected: true,
                            detectedAt: Date.now()
                        });
                    }
                } finally {
                    setIsDetectingGPS(false);
                }
            },
            (error) => {
                setIsDetectingGPS(false);
                console.warn("GPS Geolocation notice:", error.message);
                if (!silent && !isAuto) {
                    alert("📍 Location permission was denied or unavailable. Please pick your city from the list.");
                }
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
        fetchFavorites(userToken);
    };

    useEffect(() => {
        try {
            localStorage.setItem("quickbites_cart", JSON.stringify(cartItems));
            localStorage.setItem("quickbites_thalis", JSON.stringify(customThalis));
            if (cartRestaurant) {
                localStorage.setItem("quickbites_cart_restaurant", JSON.stringify(cartRestaurant));
            } else {
                localStorage.removeItem("quickbites_cart_restaurant");
            }
        } catch (e) {}
    }, [cartItems, customThalis, cartRestaurant]);

    const logoutUser = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("quickbites_user");
        localStorage.removeItem("quickbites_cart");
        localStorage.removeItem("quickbites_thalis");
        localStorage.removeItem("quickbites_cart_restaurant");
        setToken("");
        setUser(null);
        setCartItems({});
        setCustomThalis([]);
        setCartRestaurant(null);
        setFavorites({ foods: [], restaurants: [] });
    };

    const clearCart = () => {
        setCartItems({});
        setCustomThalis([]);
        setCartRestaurant(null);
        localStorage.removeItem("quickbites_cart");
        localStorage.removeItem("quickbites_thalis");
        localStorage.removeItem("quickbites_cart_restaurant");
    };

    const addToCart = async (itemId, forceClear = false) => {
        const item = food_list.find((f) => f._id === itemId);
        const itemRestId = item?.restaurantId?._id || item?.restaurantId || "central";
        const itemRestName = item?.restaurantId?.name || "QuickBites Central Kitchen";
        const itemPackagingFee = item?.restaurantId?.packagingFee || 20;

        const hasExistingItems =
            Object.values(cartItems).some((qty) => qty > 0) ||
            customThalis.some((t) => t.quantity > 0);

        if (hasExistingItems && cartRestaurant && cartRestaurant.id && cartRestaurant.id !== itemRestId && !forceClear) {
            setCartConflict({
                isOpen: true,
                pendingItemId: itemId,
                pendingThali: null,
                oldName: cartRestaurant.name || "Previous Restaurant",
                newName: itemRestName
            });
            return;
        }

        if (forceClear) {
            setCartItems({ [itemId]: 1 });
            setCustomThalis([]);
            setCartRestaurant({ id: itemRestId, name: itemRestName, packagingFee: itemPackagingFee });
        } else {
            setCartItems((prev) => ({
                ...prev,
                [itemId]: (prev[itemId] || 0) + 1
            }));
            if (!cartRestaurant || !hasExistingItems) {
                setCartRestaurant({ id: itemRestId, name: itemRestName, packagingFee: itemPackagingFee });
            }
        }

        if (token && url && !token.startsWith("quickbites_local_")) {
            try {
                await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
            } catch (e) {
                console.warn("Cart sync notice:", e.message);
            }
        }
    };

    const addThaliToCart = (thaliConfig, forceClear = false) => {
        const thaliRestId = thaliConfig.restaurantId?._id || thaliConfig.restaurantId || "central";
        const thaliRestName = thaliConfig.restaurantName || "QuickBites Restaurant";
        const thaliPackagingFee = thaliConfig.packagingFee || 20;

        const hasExistingItems =
            Object.values(cartItems).some((qty) => qty > 0) ||
            customThalis.some((t) => t.quantity > 0);

        if (hasExistingItems && cartRestaurant && cartRestaurant.id && cartRestaurant.id !== thaliRestId && !forceClear) {
            setCartConflict({
                isOpen: true,
                pendingItemId: null,
                pendingThali: thaliConfig,
                oldName: cartRestaurant.name || "Previous Restaurant",
                newName: thaliRestName
            });
            return;
        }

        // Generate deterministic signature based on templateId + sorted selections + prepNotes
        const compSig = (thaliConfig.components || [])
            .map((c) => `${c.groupId || c.groupName}_${c.componentId || c.name}_${c.quantity || 1}`)
            .sort()
            .join("|");
        const prepSig = (thaliConfig.preparationInstructions || "").trim().toLowerCase();
        const configSignature = `thali_${thaliConfig.templateId}_${compSig}_${prepSig}`;

        if (forceClear) {
            setCartItems({});
            setCustomThalis([
                {
                    ...thaliConfig,
                    cartItemId: configSignature,
                    quantity: 1
                }
            ]);
            setCartRestaurant({ id: thaliRestId, name: thaliRestName, packagingFee: thaliPackagingFee });
        } else {
            setCustomThalis((prev) => {
                const existingIdx = prev.findIndex((t) => t.cartItemId === configSignature);
                if (existingIdx >= 0) {
                    const copy = [...prev];
                    copy[existingIdx] = { ...copy[existingIdx], quantity: copy[existingIdx].quantity + 1 };
                    return copy;
                } else {
                    return [
                        ...prev,
                        {
                            ...thaliConfig,
                            cartItemId: configSignature,
                            quantity: 1
                        }
                    ];
                }
            });
            if (!cartRestaurant || !hasExistingItems) {
                setCartRestaurant({ id: thaliRestId, name: thaliRestName, packagingFee: thaliPackagingFee });
            }
        }
    };

    const removeThaliFromCart = (cartItemId) => {
        setCustomThalis((prev) => {
            const next = [];
            for (const item of prev) {
                if (item.cartItemId === cartItemId) {
                    if (item.quantity > 1) {
                        next.push({ ...item, quantity: item.quantity - 1 });
                    }
                } else {
                    next.push(item);
                }
            }
            const hasRegular = Object.values(cartItems).some((q) => q > 0);
            if (!hasRegular && next.length === 0) {
                setCartRestaurant(null);
            }
            return next;
        });
    };

    const deleteThaliFromCart = (cartItemId) => {
        setCustomThalis((prev) => {
            const next = prev.filter((item) => item.cartItemId !== cartItemId);
            const hasRegular = Object.values(cartItems).some((q) => q > 0);
            if (!hasRegular && next.length === 0) {
                setCartRestaurant(null);
            }
            return next;
        });
    };

    const updateThaliInCart = (oldCartItemId, newThaliConfig) => {
        const compSig = (newThaliConfig.components || [])
            .map((c) => `${c.groupId || c.groupName}_${c.componentId || c.name}_${c.quantity || 1}`)
            .sort()
            .join("|");
        const prepSig = (newThaliConfig.preparationInstructions || "").trim().toLowerCase();
        const newSignature = `thali_${newThaliConfig.templateId}_${compSig}_${prepSig}`;

        setCustomThalis((prev) => {
            const oldItem = prev.find((t) => t.cartItemId === oldCartItemId);
            const preservedQty = oldItem ? oldItem.quantity : 1;
            const filtered = prev.filter((t) => t.cartItemId !== oldCartItemId);
            return [
                ...filtered,
                {
                    ...newThaliConfig,
                    cartItemId: newSignature,
                    quantity: preservedQty
                }
            ];
        });
    };

    const resolveCartConflict = (shouldClear) => {
        if (shouldClear) {
            if (cartConflict.pendingThali) {
                addThaliToCart(cartConflict.pendingThali, true);
            } else if (cartConflict.pendingItemId) {
                addToCart(cartConflict.pendingItemId, true);
            }
        }
        setCartConflict({ isOpen: false, pendingItemId: null, pendingThali: null, oldName: "", newName: "" });
    };

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => {
            const next = { ...prev };
            if (next[itemId] > 1) {
                next[itemId] -= 1;
            } else {
                delete next[itemId];
            }
            const hasThalis = customThalis.some((t) => t.quantity > 0);
            if ((Object.keys(next).length === 0 || Object.values(next).every((q) => q <= 0)) && !hasThalis) {
                setCartRestaurant(null);
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
        for (const thali of customThalis) {
            if (thali.quantity > 0 && thali.unitPriceRupees) {
                totalAmount += thali.unitPriceRupees * thali.quantity;
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
        for (const thali of customThalis) {
            if (thali.quantity > 0) {
                count += thali.quantity;
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

    const getPricingBreakdown = () => {
        const subtotal = getTotalCartAmount();
        const packagingFee = subtotal > 0 ? (cartRestaurant?.packagingFee || 20) : 0;
        const deliveryFee = subtotal === 0 ? 0 : (discount === 40 && promoCode === "FREESHIP" ? 0 : 40);
        const platformFee = subtotal > 0 ? 5 : 0;
        const gstTax = Math.round(subtotal * 0.05); // 5% GST on restaurant food
        const promoDiscount = promoCode === "FREESHIP" ? 0 : discount;
        const total = Math.max(0, subtotal + packagingFee + deliveryFee + platformFee + gstTax - promoDiscount);

        return {
            subtotal,
            packagingFee,
            deliveryFee,
            platformFee,
            gstTax,
            discount: promoDiscount,
            total
        };
    };

    const fetchRestaurants = async (cityName = "") => {
        try {
            const targetCity = cityName || currentLocation?.city || "";
            const response = await axios.get(`${url}/api/restaurant/list?city=${encodeURIComponent(targetCity)}`);
            if (response.data && response.data.success) {
                setRestaurants(response.data.restaurants || []);
            }
        } catch (e) {
            console.warn("Could not fetch restaurants from API:", e.message);
        }
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

    const fetchFavorites = async (authToken = token) => {
        if (!authToken) return;
        try {
            const res = await axios.get(url + "/api/user/favorites", {
                headers: { token: authToken }
            });
            if (res.data && res.data.success) {
                setFavorites({
                    foods: res.data.favoriteFoods || [],
                    restaurants: res.data.favoriteRestaurants || []
                });
            }
        } catch (err) {
            console.warn("Could not fetch favorites:", err.message);
        }
    };

    const toggleFavoriteFood = async (foodId) => {
        if (!token) {
            alert("Please login to save your favorite dishes!");
            return;
        }
        try {
            const res = await axios.post(
                url + "/api/user/favorites/food/toggle",
                { foodId },
                { headers: { token } }
            );
            if (res.data && res.data.success) {
                await fetchFavorites(token);
            }
        } catch (err) {
            console.error("Toggle favorite food error:", err);
        }
    };

    const toggleFavoriteRestaurant = async (restaurantId) => {
        if (!token) {
            alert("Please login to save your favorite restaurants!");
            return;
        }
        try {
            const res = await axios.post(
                url + "/api/user/favorites/restaurant/toggle",
                { restaurantId },
                { headers: { token } }
            );
            if (res.data && res.data.success) {
                await fetchFavorites(token);
            }
        } catch (err) {
            console.error("Toggle favorite restaurant error:", err);
        }
    };

    const isFoodFavorite = (foodId) => {
        if (!foodId) return false;
        return (favorites.foods || []).some(f => (f._id || f).toString() === foodId.toString());
    };

    const isRestaurantFavorite = (restId) => {
        if (!restId) return false;
        return (favorites.restaurants || []).some(r => (r._id || r).toString() === restId.toString());
    };

    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            await fetchRestaurants();
            
            // Auto-detect user's real live location on app open (no stale location)
            detectGPSLocation({ isAuto: true, silent: true });

            const savedToken = localStorage.getItem("token");
            if (savedToken) {
                setToken(savedToken);
                await loadCartData(savedToken);
                await fetchFavorites(savedToken);
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
        customThalis,
        setCustomThalis,
        cartRestaurant,
        cartConflict,
        resolveCartConflict,
        clearCart,
        restaurants,
        fetchRestaurants,
        addToCart,
        removeFromCart,
        addThaliToCart,
        removeThaliFromCart,
        deleteThaliFromCart,
        updateThaliInCart,
        getTotalCartAmount,
        getTotalItemsCount,
        getPricingBreakdown,
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
        isDetectingGPS,
        favorites,
        fetchFavorites,
        toggleFavoriteFood,
        toggleFavoriteRestaurant,
        isFoodFavorite,
        isRestaurantFavorite
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;