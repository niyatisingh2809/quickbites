import React, { useContext } from 'react';
import './CartConflictModal.css';
import { StoreContext } from '../../Context/StoreContext';

const CartConflictModal = () => {
  const { cartConflict, resolveCartConflict } = useContext(StoreContext);

  if (!cartConflict || !cartConflict.isOpen) return null;

  return (
    <div className='cart-conflict-overlay'>
      <div className='cart-conflict-modal'>
        <div className='conflict-modal-icon'>🍱 ➔ 🍲</div>
        <h3 className='conflict-modal-title'>Replace Cart Items?</h3>
        <p className='conflict-modal-desc'>
          Your cart already contains items from <strong>{cartConflict.oldName}</strong>.
          <br />
          QuickBites orders are strictly single-restaurant to ensure fast, fresh deliveries. Would you like to clear your cart and start a new order with <strong>{cartConflict.newName}</strong>?
        </p>

        <div className='conflict-modal-actions'>
          <button
            type='button'
            className='btn-conflict-cancel'
            onClick={() => resolveCartConflict(false)}
          >
            Keep Existing Cart
          </button>
          <button
            type='button'
            className='btn-conflict-confirm'
            onClick={() => resolveCartConflict(true)}
          >
            Discard & Start Fresh 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartConflictModal;
