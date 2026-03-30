import { Link } from '@inertiajs/react';
import React, { useState } from 'react';
import { Col, Dropdown, Row } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';

const cartData = [
    { id: 1, icon: 'ri-shirt-line', product: 'Branded T-Shirts', quantity: 10, price: 32 },
    { id: 2, icon: 'ri-sofa-line', product: 'Bentwood Chair', quantity: 5, price: 18 },
    { id: 3, icon: 'ri-cup-line', product: 'Borosil Paper Cup', quantity: 3, price: 250 },
    { id: 4, icon: 'ri-t-shirt-air-line', product: 'Gray Styled T-Shirt', quantity: 1, price: 1250 },
    { id: 5, icon: 'ri-shield-star-line', product: 'Stillbird Helmet', quantity: 2, price: 495 },
];

export default function MyCartDropdown() {
    const [isCartDropdown, setIsCartDropdown] = useState(false);
    const [cartItem, setCartItem] = useState(cartData.length);

    const removeItem = (target: HTMLElement | null) => {
        if (!target) {
            return;
        }

        const priceElement = target.closest('.dropdown-item-cart')?.querySelector('.cart-item-price');
        const subTotalElement = document.getElementById('cart-item-total');

        if (priceElement && subTotalElement) {
            const price = Number.parseFloat(priceElement.textContent ?? '0');
            const subTotal = Number.parseFloat(subTotalElement.textContent ?? '0');
            subTotalElement.textContent = `${Math.max(subTotal - price, 0).toFixed(2)}`;
        }

        target.closest('.dropdown-item-cart')?.remove();
        const remaining = document.querySelectorAll('.dropdown-item-cart').length;
        const emptyCart = document.getElementById('empty-cart');
        if (emptyCart) {
            emptyCart.style.display = remaining === 0 ? 'block' : 'none';
        }
        setCartItem(remaining);
    };

    return (
        <Dropdown
            show={isCartDropdown}
            onToggle={(nextShow) => setIsCartDropdown(nextShow)}
            className="topbar-head-dropdown ms-1 header-item"
        >
            <Dropdown.Toggle type="button" as="button" className="arrow-none btn btn-icon btn-topbar btn-ghost-secondary rounded-circle">
                <i className="bx bx-shopping-bag fs-22"></i>
                <span className="position-absolute cartitem-badge topbar-badge fs-10 translate-middle badge rounded-pill bg-info">
                    {cartItem}
                    <span className="visually-hidden">cart items</span>
                </span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-xl dropdown-menu-end p-0 dropdown-menu-cart">
                <div className="p-3 border-top-0 border-start-0 border-end-0 border-dashed border">
                    <Row className="align-items-center">
                        <Col>
                            <h6 className="m-0 fs-16 fw-semibold">My Cart</h6>
                        </Col>
                        <div className="col-auto">
                            <span className="badge bg-warning-subtle text-warning fs-13">
                                <span className="cartitem-badge">{cartItem}</span> items
                            </span>
                        </div>
                    </Row>
                </div>
                <SimpleBar style={{ maxHeight: '300px' }}>
                    <div className="p-2">
                        <div className="text-center empty-cart" id="empty-cart" style={{ display: 'none' }}>
                            <div className="avatar-md mx-auto my-3">
                                <div className="avatar-title bg-info-subtle text-info fs-36 rounded-circle">
                                    <i className="bx bx-cart"></i>
                                </div>
                            </div>
                            <h5 className="mb-3">Your Cart is Empty!</h5>
                            <Link href="#" className="btn btn-success w-md mb-3">Shop Now</Link>
                        </div>

                        {cartData.map((item) => (
                            <div className="d-block dropdown-item text-wrap dropdown-item-cart px-3 py-2" key={item.id}>
                                <div className="d-flex align-items-center">
                                    <div className="me-3 rounded-circle avatar-sm p-2 bg-light d-flex align-items-center justify-content-center">
                                        <i className={`${item.icon} fs-20 text-primary`}></i>
                                    </div>
                                    <div className="flex-grow-1">
                                        <h6 className="mt-0 mb-1 fs-14">
                                            <Link href="#" className="text-reset">{item.product}</Link>
                                        </h6>
                                        <p className="mb-0 fs-12 text-muted">
                                            Quantity: <span>{item.quantity} x ${item.price}</span>
                                        </p>
                                    </div>
                                    <div className="px-2">
                                        <h5 className="m-0 fw-normal">$<span className="cart-item-price">{item.quantity * item.price}</span></h5>
                                    </div>
                                    <div className="ps-2">
                                        <button type="button" className="btn btn-icon btn-sm btn-ghost-secondary remove-item-btn" onClick={(event) => removeItem(event.currentTarget)}>
                                            <i className="ri-close-fill fs-16"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </SimpleBar>
                <div className="p-3 border-bottom-0 border-start-0 border-end-0 border-dashed border" id="checkout-elem">
                    <div className="d-flex justify-content-between align-items-center pb-3">
                        <h5 className="m-0 text-muted">Total:</h5>
                        <div className="px-2">
                            <h5 className="m-0">$<span id="cart-item-total">3400</span></h5>
                        </div>
                    </div>

                    <Link href="#" className="btn btn-success text-center w-100">
                        Checkout
                    </Link>
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
}
