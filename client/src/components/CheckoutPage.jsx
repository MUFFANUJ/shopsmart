import React, { useState } from 'react';

function CheckoutPage({ cart, onPlaceOrder, onBack }) {
  const [step, setStep] = useState('shipping'); // shipping → payment → processing → confirmed
  const [shipping, setShipping] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'India',
  });
  const [payment, setPayment] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});
  const [orderId, setOrderId] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping_cost = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping_cost + tax;

  const validateShipping = () => {
    const errs = {};
    if (!shipping.fullName.trim()) errs.fullName = 'Full name is required';
    if (!shipping.email.trim() || !/\S+@\S+\.\S+/.test(shipping.email))
      errs.email = 'Valid email is required';
    if (!shipping.address.trim()) errs.address = 'Address is required';
    if (!shipping.city.trim()) errs.city = 'City is required';
    if (!shipping.zipCode.trim()) errs.zipCode = 'ZIP code is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePayment = () => {
    const errs = {};
    const cardNum = payment.cardNumber.replace(/\s/g, '');
    if (!cardNum || cardNum.length < 16) errs.cardNumber = 'Valid card number is required';
    if (!payment.cardName.trim()) errs.cardName = 'Name on card is required';
    if (!payment.expiry.trim() || !/^\d{2}\/\d{2}$/.test(payment.expiry))
      errs.expiry = 'Valid expiry (MM/YY) is required';
    if (!payment.cvv.trim() || payment.cvv.length < 3) errs.cvv = 'Valid CVV is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep('payment');
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (validatePayment()) {
      setStep('processing');
      // Simulate payment processing
      setTimeout(() => {
        const id = 'ORD-' + Date.now().toString(36).toUpperCase();
        setOrderId(id);
        setStep('confirmed');
        onPlaceOrder(id);
      }, 2000);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 16);
    return v.replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 4);
    if (v.length > 2) return v.slice(0, 2) + '/' + v.slice(2);
    return v;
  };

  if (step === 'confirmed') {
    return (
      <div className="checkout-page">
        <div className="checkout-confirmation">
          <div className="checkout-confirmation__icon">✅</div>
          <h2 className="checkout-confirmation__title">Order Confirmed!</h2>
          <p className="checkout-confirmation__text">
            Your order <strong>{orderId}</strong> has been placed successfully.
          </p>
          <p className="checkout-confirmation__text">
            A confirmation email has been sent to <strong>{shipping.email}</strong>
          </p>

          <div className="checkout-confirmation__details">
            <div className="checkout-confirmation__row">
              <span>Items</span>
              <span>{cart.reduce((sum, item) => sum + item.qty, 0)} products</span>
            </div>
            <div className="checkout-confirmation__row">
              <span>Total Paid</span>
              <span className="checkout-confirmation__total">${total.toFixed(2)}</span>
            </div>
            <div className="checkout-confirmation__row">
              <span>Shipping To</span>
              <span>
                {shipping.city}, {shipping.country}
              </span>
            </div>
          </div>

          <button className="checkout-confirmation__btn" onClick={onBack}>
            ← Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="checkout-page">
        <div className="checkout-processing">
          <div className="checkout-processing__spinner" />
          <h2 className="checkout-processing__title">Processing Payment...</h2>
          <p className="checkout-processing__text">
            Please wait while we securely process your payment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <button className="checkout-page__back" onClick={onBack}>
        ← Back to Shop
      </button>

      <h1 className="checkout-page__title">
        {step === 'shipping' ? '📦 Shipping Details' : '💳 Payment'}
      </h1>

      <div className="checkout-page__grid">
        {/* Form Section */}
        <div className="checkout-page__form-section">
          {/* Progress Steps */}
          <div className="checkout-steps">
            <div
              className={`checkout-steps__step ${step === 'shipping' ? 'checkout-steps__step--active' : 'checkout-steps__step--done'}`}
            >
              <span className="checkout-steps__num">1</span>
              <span>Shipping</span>
            </div>
            <div className="checkout-steps__line" />
            <div
              className={`checkout-steps__step ${step === 'payment' ? 'checkout-steps__step--active' : ''}`}
            >
              <span className="checkout-steps__num">2</span>
              <span>Payment</span>
            </div>
          </div>

          {step === 'shipping' && (
            <form className="checkout-form" onSubmit={handleShippingSubmit}>
              <div className="checkout-form__group">
                <label className="checkout-form__label">Full Name</label>
                <input
                  className={`checkout-form__input ${errors.fullName ? 'checkout-form__input--error' : ''}`}
                  value={shipping.fullName}
                  onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                  placeholder="John Doe"
                />
                {errors.fullName && <span className="checkout-form__error">{errors.fullName}</span>}
              </div>

              <div className="checkout-form__group">
                <label className="checkout-form__label">Email</label>
                <input
                  className={`checkout-form__input ${errors.email ? 'checkout-form__input--error' : ''}`}
                  type="email"
                  value={shipping.email}
                  onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                  placeholder="john@example.com"
                />
                {errors.email && <span className="checkout-form__error">{errors.email}</span>}
              </div>

              <div className="checkout-form__group">
                <label className="checkout-form__label">Address</label>
                <input
                  className={`checkout-form__input ${errors.address ? 'checkout-form__input--error' : ''}`}
                  value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                  placeholder="123 Main Street"
                />
                {errors.address && <span className="checkout-form__error">{errors.address}</span>}
              </div>

              <div className="checkout-form__row">
                <div className="checkout-form__group">
                  <label className="checkout-form__label">City</label>
                  <input
                    className={`checkout-form__input ${errors.city ? 'checkout-form__input--error' : ''}`}
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    placeholder="Mumbai"
                  />
                  {errors.city && <span className="checkout-form__error">{errors.city}</span>}
                </div>
                <div className="checkout-form__group">
                  <label className="checkout-form__label">ZIP Code</label>
                  <input
                    className={`checkout-form__input ${errors.zipCode ? 'checkout-form__input--error' : ''}`}
                    value={shipping.zipCode}
                    onChange={(e) => setShipping({ ...shipping, zipCode: e.target.value })}
                    placeholder="400001"
                  />
                  {errors.zipCode && <span className="checkout-form__error">{errors.zipCode}</span>}
                </div>
              </div>

              <button className="checkout-form__submit" type="submit">
                Continue to Payment →
              </button>
            </form>
          )}

          {step === 'payment' && (
            <form className="checkout-form" onSubmit={handlePaymentSubmit}>
              <div className="checkout-form__card-icons">
                <span>💳 Visa</span>
                <span>💳 Mastercard</span>
                <span>💳 Amex</span>
              </div>

              <div className="checkout-form__group">
                <label className="checkout-form__label">Card Number</label>
                <input
                  className={`checkout-form__input ${errors.cardNumber ? 'checkout-form__input--error' : ''}`}
                  value={payment.cardNumber}
                  onChange={(e) =>
                    setPayment({ ...payment, cardNumber: formatCardNumber(e.target.value) })
                  }
                  placeholder="4242 4242 4242 4242"
                  maxLength="19"
                />
                {errors.cardNumber && (
                  <span className="checkout-form__error">{errors.cardNumber}</span>
                )}
              </div>

              <div className="checkout-form__group">
                <label className="checkout-form__label">Name on Card</label>
                <input
                  className={`checkout-form__input ${errors.cardName ? 'checkout-form__input--error' : ''}`}
                  value={payment.cardName}
                  onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                  placeholder="John Doe"
                />
                {errors.cardName && <span className="checkout-form__error">{errors.cardName}</span>}
              </div>

              <div className="checkout-form__row">
                <div className="checkout-form__group">
                  <label className="checkout-form__label">Expiry</label>
                  <input
                    className={`checkout-form__input ${errors.expiry ? 'checkout-form__input--error' : ''}`}
                    value={payment.expiry}
                    onChange={(e) =>
                      setPayment({ ...payment, expiry: formatExpiry(e.target.value) })
                    }
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                  {errors.expiry && <span className="checkout-form__error">{errors.expiry}</span>}
                </div>
                <div className="checkout-form__group">
                  <label className="checkout-form__label">CVV</label>
                  <input
                    className={`checkout-form__input ${errors.cvv ? 'checkout-form__input--error' : ''}`}
                    type="password"
                    value={payment.cvv}
                    onChange={(e) =>
                      setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })
                    }
                    placeholder="•••"
                    maxLength="4"
                  />
                  {errors.cvv && <span className="checkout-form__error">{errors.cvv}</span>}
                </div>
              </div>

              <div className="checkout-form__actions">
                <button
                  type="button"
                  className="checkout-form__back-btn"
                  onClick={() => setStep('shipping')}
                >
                  ← Back
                </button>
                <button className="checkout-form__submit" type="submit">
                  🔒 Pay ${total.toFixed(2)}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Order Summary */}
        <div className="checkout-summary">
          <h3 className="checkout-summary__title">Order Summary</h3>

          <div className="checkout-summary__items">
            {cart.map((item) => (
              <div className="checkout-summary__item" key={item.id}>
                <div className="checkout-summary__item-img">
                  {item.image ? <img src={item.image} alt={item.name} /> : <span>📦</span>}
                </div>
                <div className="checkout-summary__item-info">
                  <div className="checkout-summary__item-name">{item.name}</div>
                  <div className="checkout-summary__item-qty">Qty: {item.qty}</div>
                </div>
                <div className="checkout-summary__item-price">
                  ${(item.price * item.qty).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-summary__totals">
            <div className="checkout-summary__row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="checkout-summary__row">
              <span>Shipping</span>
              <span>{shipping_cost === 0 ? 'FREE' : `$${shipping_cost.toFixed(2)}`}</span>
            </div>
            <div className="checkout-summary__row">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="checkout-summary__row checkout-summary__row--total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {subtotal < 100 && (
            <div className="checkout-summary__free-ship">
              💡 Add ${(100 - subtotal).toFixed(2)} more for free shipping!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
