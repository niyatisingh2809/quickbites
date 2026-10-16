import React, { useState, useEffect, useContext } from 'react';
import './ThaliBuilderModal.css';
import { StoreContext } from '../../Context/StoreContext';

const ThaliBuilderModal = ({
  isOpen,
  onClose,
  template,
  existingConfig = null,
  onSave,
  onCancel = null,
  flowCartItemId = null,
  removeItemOnCancel = null
}) => {
  if (!isOpen || !template) return null;

  const { removeThaliFromCart, deleteThaliFromCart } = useContext(StoreContext) || {};

  const groups = template.componentGroups || [];
  const reviewStepIndex = groups.length;

  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [selectedNote, setSelectedNote] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Prepopulate selections if existingConfig is provided (Edit Mode from Cart)
  useEffect(() => {
    if (existingConfig && existingConfig.components) {
      const initialMap = {};
      existingConfig.components.forEach((c) => {
        const gId = c.groupId || (groups.find((g) => g.name === c.groupName)?.groupId);
        if (gId) {
          if (!initialMap[gId]) initialMap[gId] = {};
          initialMap[gId][c.componentId] = c.quantity || 1;
        }
      });
      setSelections(initialMap);

      const prep = existingConfig.preparationInstructions || '';
      const allowed = template.allowedPreparationNotes || [];
      const matched = allowed.find((n) => prep.includes(n));
      if (matched) {
        setSelectedNote(matched);
        setCustomNote(prep.replace(matched, '').trim());
      } else {
        setCustomNote(prep);
      }
    } else {
      // Default initial state: auto-select the first included item in required single-choice groups
      const defaultMap = {};
      groups.forEach((grp) => {
        if (grp.isRequired && grp.minSelections === 1 && grp.maxSelections === 1) {
          const firstIncluded = grp.components.find((c) => c.isIncluded && c.isAvailable);
          if (firstIncluded) {
            defaultMap[grp.groupId] = { [firstIncluded.componentId]: 1 };
          }
        }
      });
      setSelections(defaultMap);
      setSelectedNote('');
      setCustomNote('');
    }
    setCurrentStep(0);
  }, [template, existingConfig]);

  // Compute live upgrade price
  const calculateUpgradeTotal = () => {
    let upgradeRupees = 0;
    groups.forEach((grp) => {
      const grpSel = selections[grp.groupId] || {};
      grp.components.forEach((comp) => {
        const qty = grpSel[comp.componentId] || 0;
        if (qty > 0 && comp.extraPriceRupees > 0) {
          upgradeRupees += comp.extraPriceRupees * qty;
        }
      });
    });
    return upgradeRupees;
  };

  const upgradeTotalRupees = calculateUpgradeTotal();
  const totalUnitPriceRupees = (template.basePriceRupees || 0) + upgradeTotalRupees;

  // Group selection helper
  const getGroupSelectedCount = (groupId) => {
    const grpSel = selections[groupId] || {};
    return Object.values(grpSel).reduce((sum, q) => sum + (Number(q) || 0), 0);
  };

  const handleToggleOrIncrement = (group, comp) => {
    if (!comp.isAvailable) return;

    setSelections((prev) => {
      const currentGrpMap = { ...(prev[group.groupId] || {}) };
      const currentQty = currentGrpMap[comp.componentId] || 0;
      const totalInGrp = Object.values(currentGrpMap).reduce((sum, q) => sum + q, 0);

      // Single item selection group (e.g. Rice, Dal)
      if (group.maxSelections === 1 && group.maxQuantityPerSelection === 1) {
        return {
          ...prev,
          [group.groupId]: { [comp.componentId]: 1 }
        };
      }

      // Multi-quantity or multi-selection group (e.g. Breads)
      if (currentQty === 0) {
        if (totalInGrp >= group.maxSelections) {
          return prev; // Reached max items allowed in this group
        }
        currentGrpMap[comp.componentId] = 1;
      } else {
        if (currentQty < group.maxQuantityPerSelection && totalInGrp < group.maxSelections) {
          currentGrpMap[comp.componentId] = currentQty + 1;
        }
      }

      return { ...prev, [group.groupId]: currentGrpMap };
    });
  };

  const handleDecrement = (group, comp) => {
    setSelections((prev) => {
      const currentGrpMap = { ...(prev[group.groupId] || {}) };
      const currentQty = currentGrpMap[comp.componentId] || 0;

      if (currentQty <= 1) {
        delete currentGrpMap[comp.componentId];
      } else {
        currentGrpMap[comp.componentId] = currentQty - 1;
      }

      return { ...prev, [group.groupId]: currentGrpMap };
    });
  };

  // Validation for current step
  const isGroupValid = (grp) => {
    const count = getGroupSelectedCount(grp.groupId);
    if (grp.isRequired) {
      return count >= grp.minSelections && count <= grp.maxSelections;
    }
    return count <= grp.maxSelections;
  };

  const isAllGroupsValid = () => {
    return groups.every((g) => isGroupValid(g));
  };

  const handleNextStep = () => {
    if (currentStep < reviewStepIndex) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCancel = () => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      // Discard current draft selection state
      setSelections({});
      setSelectedNote('');
      setCustomNote('');
      setCurrentStep(0);

      // If a specific draft cart item was already added by this flow, remove only that item
      const targetCartId = removeItemOnCancel || flowCartItemId;
      if (targetCartId) {
        if (typeof deleteThaliFromCart === 'function') {
          deleteThaliFromCart(targetCartId);
        } else if (typeof removeThaliFromCart === 'function') {
          removeThaliFromCart(targetCartId);
        }
      }

      // If customer was editing an existing cart item, existingConfig was passed in.
      // We simply close the modal without calling onSave!
      // This discards unsaved edits and preserves the original item in the cart unmodified.
      if (onCancel) {
        onCancel();
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Cancellation error in thali builder:', err);
      alert('⚠️ An error occurred while cancelling. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    if (isProcessing) return;
    if (!isAllGroupsValid()) {
      alert('⚠️ Please complete all required components in the thali.');
      return;
    }

    setIsProcessing(true);
    try {
      // Assemble verified flat components array for snapshot
      const componentsSnapshot = [];
      groups.forEach((grp) => {
        const grpSel = selections[grp.groupId] || {};
        grp.components.forEach((comp) => {
          const qty = grpSel[comp.componentId] || 0;
          if (qty > 0) {
            componentsSnapshot.push({
              groupId: grp.groupId,
              groupName: grp.name,
              componentId: comp.componentId,
              name: comp.name,
              quantity: qty,
              extraPriceRupees: comp.extraPriceRupees || 0,
              portion: comp.portion || '',
              image: comp.image || '',
              isVeg: comp.isVeg !== false
            });
          }
        });
      });

      const fullPrep = [selectedNote, customNote].filter(Boolean).join('. ');

      const payload = {
        templateId: template._id,
        templateName: template.name,
        restaurantId: template.restaurantId?._id || template.restaurantId,
        restaurantName: template.restaurantId?.name || 'QuickBites Kitchen',
        packagingFee: template.restaurantId?.packagingFee || 20,
        basePriceRupees: template.basePriceRupees,
        upgradePriceRupees: upgradeTotalRupees,
        unitPriceRupees: totalUnitPriceRupees,
        isVeg: template.isVeg !== false,
        preparationInstructions: fullPrep,
        components: componentsSnapshot
      };

      onSave(payload);
      onClose();
    } catch (err) {
      console.error('Error saving thali:', err);
      alert('⚠️ Failed to save thali configuration. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentGroup = groups[currentStep];

  return (
    <div className='thali-modal-backdrop' onClick={handleCancel}>
      <div className='thali-modal-container' onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className='thali-modal-header'>
          <div className='thali-modal-header-info'>
            <h2>
              🍱 {template.name}
              {template.isVeg && <span className='thali-veg-badge' title='100% Pure Veg'></span>}
            </h2>
            <p>{template.description || 'Craft your perfect custom wholesome thali meal.'}</p>
          </div>
          <button
            type='button'
            className='thali-close-btn'
            onClick={handleCancel}
            disabled={isProcessing}
            aria-label='Close and discard selection'
          >
            ✕
          </button>
        </div>

        {/* Step Navigation Bar */}
        <div className='thali-step-bar'>
          {groups.map((grp, idx) => {
            const valid = isGroupValid(grp);
            const active = currentStep === idx;
            return (
              <button
                key={grp.groupId}
                className={`thali-step-item ${active ? 'active' : ''} ${valid ? 'completed' : ''}`}
                onClick={() => setCurrentStep(idx)}
              >
                <span>{valid ? '✓' : idx + 1}.</span> {grp.name}
              </button>
            );
          })}
          <button
            className={`thali-step-item ${currentStep === reviewStepIndex ? 'active' : ''}`}
            onClick={() => {
              if (isAllGroupsValid()) setCurrentStep(reviewStepIndex);
            }}
          >
            <span>📋</span> Review & Pack
          </button>
        </div>

        {/* Body Content */}
        <div className='thali-modal-body'>
          {currentStep < reviewStepIndex && currentGroup && (
            <div>
              {/* Group Rules Banner */}
              <div className='thali-group-instructions'>
                <h3 className='thali-group-title'>Step {currentStep + 1}: Select {currentGroup.name}</h3>
                <span
                  className={`thali-group-rules-badge ${
                    isGroupValid(currentGroup)
                      ? 'fulfilled'
                      : currentGroup.isRequired
                      ? 'required'
                      : ''
                  }`}
                >
                  {isGroupValid(currentGroup)
                    ? `✓ Selected: ${getGroupSelectedCount(currentGroup.groupId)}/${currentGroup.maxSelections}`
                    : currentGroup.isRequired
                    ? `Required: Pick ${currentGroup.minSelections} - ${currentGroup.maxSelections} item(s)`
                    : `Optional: Pick up to ${currentGroup.maxSelections}`}
                </span>
              </div>

              {/* Component Cards Grid */}
              <div className='thali-components-grid'>
                {currentGroup.components.map((comp) => {
                  const grpSel = selections[currentGroup.groupId] || {};
                  const qty = grpSel[comp.componentId] || 0;
                  const isSelected = qty > 0;
                  const totalInGrp = getGroupSelectedCount(currentGroup.groupId);
                  const isMaxReached = totalInGrp >= currentGroup.maxSelections;

                  const imgSrc = comp.image
                    ? comp.image.startsWith('http')
                      ? comp.image
                      : `/images/${comp.image}`
                    : '/images/placeholder_dish.svg';

                  return (
                    <div
                      key={comp.componentId}
                      className={`thali-component-card ${isSelected ? 'selected' : ''} ${
                        !comp.isAvailable ? 'unavailable' : ''
                      }`}
                      onClick={() => {
                        if (comp.isAvailable && currentGroup.maxQuantityPerSelection === 1) {
                          handleToggleOrIncrement(currentGroup, comp);
                        }
                      }}
                    >
                      {/* Dish Photo Thumbnail & Portion Badge */}
                      <div className='thali-comp-img-container'>
                        <img
                          src={imgSrc}
                          alt={comp.name}
                          loading='lazy'
                          className='thali-comp-thumbnail'
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/placeholder_dish.svg';
                          }}
                        />
                        {comp.portion && (
                          <span className='thali-portion-badge' title={`Portion: ${comp.portion}`}>
                            {comp.portion}
                          </span>
                        )}
                      </div>

                      <div className='thali-comp-info'>
                        <div className='thali-comp-header'>
                          {comp.isVeg && <span className='thali-veg-badge' title='100% Pure Veg'></span>}
                          <h4 className='thali-comp-name'>{comp.name}</h4>
                        </div>
                        {comp.description && <p className='thali-comp-desc'>{comp.description}</p>}
                        <div
                          className={`thali-comp-price ${
                            comp.extraPriceRupees > 0 ? 'upgrade' : 'included'
                          }`}
                        >
                          {comp.extraPriceRupees > 0
                            ? `+ ₹${comp.extraPriceRupees} upgrade`
                            : '✓ Included in Base Price'}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className='thali-comp-action-col' onClick={(e) => e.stopPropagation()}>
                        {!comp.isAvailable ? (
                          <span className='thali-soldout-label'>Sold Out</span>
                        ) : currentGroup.maxQuantityPerSelection > 1 ? (
                          <div className='thali-qty-controls'>
                            {isSelected && (
                              <button
                                type='button'
                                className='thali-qty-btn'
                                onClick={() => handleDecrement(currentGroup, comp)}
                                aria-label={`Decrease ${comp.name}`}
                              >
                                -
                              </button>
                            )}
                            {isSelected && <span className='thali-qty-num'>{qty}</span>}
                            <button
                              type='button'
                              className='thali-qty-btn'
                              disabled={isMaxReached && !isSelected}
                              onClick={() => handleToggleOrIncrement(currentGroup, comp)}
                              aria-label={`Increase ${comp.name}`}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type='button'
                            className={`thali-select-btn ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleToggleOrIncrement(currentGroup, comp)}
                          >
                            {isSelected ? '✓ Selected' : 'Choose'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Final Review & Notes Step */}
          {currentStep === reviewStepIndex && (
            <div className='thali-review-card'>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0f172a' }}>
                🍽️ Review Your Custom Thali Plate
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
                All components will be freshly packed by {template.restaurantId?.name || 'the kitchen'}.
              </p>

              <div className='thali-plate-summary'>
                {groups.map((grp) => {
                  const grpSel = selections[grp.groupId] || {};
                  const chosenComps = grp.components.filter((c) => grpSel[c.componentId] > 0);
                  if (chosenComps.length === 0) return null;

                  return (
                    <div key={grp.groupId} className='thali-plate-group-item'>
                      <strong>{grp.name}:</strong>
                      <div className='thali-plate-items-list'>
                        {chosenComps.map((c) => {
                          const q = grpSel[c.componentId];
                          const cImg = c.image
                            ? c.image.startsWith('http')
                              ? c.image
                              : `/images/${c.image}`
                            : '/images/placeholder_dish.svg';
                          return (
                            <div key={c.componentId} className='thali-plate-review-row'>
                              <img
                                src={cImg}
                                alt={c.name}
                                className='thali-plate-review-img'
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/images/placeholder_dish.svg';
                                }}
                              />
                              <div className='thali-plate-review-text'>
                                <span className='thali-plate-review-name'>
                                  {c.name} {q > 1 ? `x ${q}` : ''}
                                </span>
                                {c.portion && (
                                  <span className='thali-plate-review-portion'>• {c.portion}</span>
                                )}
                              </div>
                              {c.extraPriceRupees > 0 && (
                                <span className='thali-plate-review-extra'>
                                  +₹{c.extraPriceRupees * q}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Kitchen Instructions */}
              <div className='thali-prep-section'>
                <h4>👨‍🍳 Kitchen Preparation Note (Optional)</h4>
                {template.allowedPreparationNotes && template.allowedPreparationNotes.length > 0 && (
                  <div className='thali-note-chips'>
                    {template.allowedPreparationNotes.map((note) => (
                      <button
                        key={note}
                        type='button'
                        className={`thali-note-chip ${selectedNote === note ? 'selected' : ''}`}
                        onClick={() => setSelectedNote(selectedNote === note ? '' : note)}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                )}
                <input
                  type='text'
                  className='thali-prep-input'
                  placeholder='e.g. Less oil in dal, extra salad lemons...'
                  value={customNote}
                  maxLength={120}
                  onChange={(e) => setCustomNote(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sticky Live Price Footer */}
        <div className='thali-modal-footer'>
          <div className='thali-live-price'>
            <span className='thali-price-breakdown-sub'>
              Base ₹{template.basePriceRupees} {upgradeTotalRupees > 0 && `+ Upgrades ₹${upgradeTotalRupees}`}
            </span>
            <span className='thali-price-total'>₹{totalUnitPriceRupees}</span>
          </div>

          <div className='thali-action-btns'>
            {currentStep > 0 && (
              <button
                type='button'
                className='thali-nav-btn prev'
                onClick={handlePrevStep}
                disabled={isProcessing}
                aria-label='Previous group'
              >
                ← Back
              </button>
            )}

            <button
              type='button'
              className='thali-nav-btn cancel'
              onClick={handleCancel}
              disabled={isProcessing}
              aria-label='Cancel selection'
            >
              Cancel
            </button>

            {currentStep < reviewStepIndex ? (
              <button
                type='button'
                className='thali-nav-btn next proceed'
                disabled={(currentGroup && !isGroupValid(currentGroup)) || isProcessing}
                onClick={handleNextStep}
                aria-label='Proceed to next group'
              >
                Proceed →
              </button>
            ) : (
              <button
                type='button'
                className='thali-nav-btn submit proceed'
                disabled={!isAllGroupsValid() || isProcessing}
                onClick={handleFinish}
                aria-label={existingConfig ? 'Proceed and save changes' : 'Proceed and add thali to cart'}
              >
                {isProcessing ? 'Saving...' : `✓ ${existingConfig ? 'Proceed & Save' : 'Proceed & Add to Cart'}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThaliBuilderModal;
