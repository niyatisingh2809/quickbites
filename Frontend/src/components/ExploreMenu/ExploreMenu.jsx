import React, { useRef, useContext } from "react";
import "./ExploreMenu.css";
import { menu_list } from "../../assets/assets";
import { LanguageContext } from "../../Context/LanguageContext";

const ExploreMenu = ({ category, setCategory }) => {
    const listRef = useRef(null);
    const langCtx = useContext(LanguageContext);
    const t = langCtx?.t || ((k) => k);

    const scroll = (direction) => {
        if (listRef.current) {
            const scrollAmount = direction === 'left' ? -280 : 280;
            listRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div id="explore-menu" className="explore-menu-section">
            <div className="explore-menu-header-row">
                <div className="explore-header-left">
                    <span className="explore-eyebrow">🍽️ WHAT'S ON YOUR MIND?</span>
                    <h2 className="explore-title">{t('exploreMenu')}</h2>
                    <p className="explore-subtext">
                        {t('exploreSubtitle')}
                    </p>
                </div>

                <div className="explore-header-controls">
                    <span className="explore-category-pill">12 Categories • 120+ Items</span>
                    <div className="explore-nav-arrows">
                        <button type="button" onClick={() => scroll('left')} className="nav-arrow-btn" title="Scroll Left">
                            ←
                        </button>
                        <button type="button" onClick={() => scroll('right')} className="nav-arrow-btn" title="Scroll Right">
                            →
                        </button>
                    </div>
                </div>
            </div>

            <div className="explore-menu-list" ref={listRef}>
                {/* ALL DISHES OPTION */}
                <div
                    className={`explore-menu-item ${category === "All" ? "active" : ""}`}
                    onClick={() => setCategory("All")}
                >
                    <div className="menu-circle-frame all-circle-frame">
                        <span className="all-icon-emoji">✨</span>
                        {category === "All" && <span className="active-badge-tick">✓</span>}
                    </div>
                    <p className="menu-category-name">{t('allDishes')}</p>
                </div>

                {/* DYNAMIC CATEGORIES */}
                {menu_list.map((item, index) => {
                    const isActive = category === item.menu_name;
                    const displayName = item.menu_name === 'Deserts' ? 'Desserts' : item.menu_name;

                    return (
                        <div
                            key={index}
                            className={`explore-menu-item ${isActive ? "active" : ""}`}
                            onClick={() =>
                                setCategory((prev) =>
                                    prev === item.menu_name ? "All" : item.menu_name
                                )
                            }
                        >
                            <div className="menu-circle-frame">
                                <img
                                    className="menu-circle-img"
                                    src={item.menu_image}
                                    alt={displayName}
                                />
                                {isActive && (
                                    <span className="active-badge-tick active-badge-cross" title="Click to clear filter">
                                        ✕
                                    </span>
                                )}
                            </div>
                            <p className="menu-category-name">
                                {displayName}
                                {isActive && <span className="category-cross-tag" title="Click to clear"> ✕</span>}
                            </p>
                        </div>
                    );
                })}
            </div>
            <div className="explore-bottom-divider"></div>
        </div>
    );
};

export default ExploreMenu;