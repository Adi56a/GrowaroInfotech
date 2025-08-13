// payment.js - Custom Amount Razorpay Integration

// 🔑 YOUR RAZORPAY CREDENTIALS (CLEARLY VISIBLE)
const RAZORPAY_CREDENTIALS = {
    KEY_ID: 'rzp_live_pdCzod7NQaVEa5',           // ✅ Your Test Key ID
    KEY_SECRET: 'Eyw9duXJIzNqcbl6ZZLWrOOw'      // ⚠️ SECRET - Don't expose in production
};

console.log('🔑 Razorpay Key ID:', RAZORPAY_CREDENTIALS.KEY_ID);
console.log('🔐 Razorpay Key Secret:', RAZORPAY_CREDENTIALS.KEY_SECRET);

// 🏢 Company Information
const COMPANY_INFO = {
    name: "Growaro Infotech Pvt Ltd",
    description: "Software Development Services",
    logo: "img/logo5.png",
    theme: {
        color: "#007bff"
    }
};

// 🎯 Main Payment Function with Custom Amount
function initiateCustomPayment(planType) {
    console.log('🚀 Starting payment for plan:', planType);
    
    // Get custom amount from input field
    const amountInput = document.getElementById(`${planType}-amount-input`);
    const customAmount = parseFloat(amountInput.value);
    
    // Validation
    if (!customAmount || customAmount < 1) {
        alert('⚠️ Please enter a valid amount (minimum ₹1)');
        amountInput.focus();
        return;
    }
    
    if (customAmount > 999999) {
        alert('⚠️ Maximum amount allowed is ₹9,99,999');
        amountInput.focus();
        return;
    }
    
    // Convert rupees to paise (₹1 = 100 paise)
    const amountInPaise = Math.round(customAmount * 100);
    
    console.log('💰 Payment Details:', {
        plan: planType,
        amountInRupees: customAmount,
        amountInPaise: amountInPaise
    });
    
    // Show loading state on button
    const button = document.getElementById(`${planType}-plan-btn`);
    const originalButtonText = button.innerHTML;
    button.innerHTML = '⏳ Processing...';
    button.disabled = true;
    
    // 🎨 Razorpay Payment Options
    const razorpayOptions = {
        key: RAZORPAY_CREDENTIALS.KEY_ID,                    // Your Key ID
        amount: amountInPaise,                               // Amount in paise
        currency: "INR",
        name: COMPANY_INFO.name,
        description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan - ₹${customAmount}`,
        image: COMPANY_INFO.logo,
        
        // 👤 Customer prefill (can be customized)
        prefill: {
            name: "",
            email: "growaroinfotech@gmail.com",
            contact: "9999999999"
        },
        
        // 📝 Notes for reference
        notes: {
            plan_type: planType,
            custom_amount: customAmount,
            payment_for: "Growaro Infotech Services"
        },
        
        // 🎨 Theme customization
        theme: COMPANY_INFO.theme,
        
        // ✅ Success Handler
        handler: function (razorpayResponse) {
            console.log('✅ Payment Successful:', razorpayResponse);
            
            // Reset button
            resetButton(button, originalButtonText);
            
            // Show success modal
            showSuccessModal(razorpayResponse, planType, customAmount);
            
            // Optional: Send to your server for verification
            // sendPaymentToServer(razorpayResponse, planType, customAmount);
        },
        
        // ❌ Modal close handler
        modal: {
            ondismiss: function() {
                console.log('❌ Payment cancelled by user');
                resetButton(button, originalButtonText);
                
                // Optional: Show cancellation message
                setTimeout(() => {
                    alert('💔 Payment cancelled. You can try again anytime!');
                }, 300);
            }
        }
    };
    
    try {
        // 🏗️ Create Razorpay instance
        const razorpayInstance = new Razorpay(razorpayOptions);
        
        // ❌ Handle payment failure
        razorpayInstance.on('payment.failed', function (response) {
            console.log('❌ Payment Failed:', response);
            resetButton(button, originalButtonText);
            showErrorModal(response.error);
        });
        
        // 🚀 Open Razorpay checkout
        razorpayInstance.open();
        
        console.log('🔓 Razorpay checkout opened');
        
    } catch (error) {
        console.error('💥 Error creating Razorpay instance:', error);
        resetButton(button, originalButtonText);
        alert('❌ Payment system error. Please refresh and try again.');
    }
}

// 🔄 Reset button to original state
function resetButton(button, originalText) {
    button.innerHTML = originalText;
    button.disabled = false;
}

// ✅ Show Success Modal
function showSuccessModal(razorpayResponse, planType, amount) {
    const modal = `
        <div id="successModal" class="payment-modal">
            <div class="modal-content">
                <div class="modal-icon">✅</div>
                <h2 style="color: #28a745; margin-bottom: 20px;">Payment Successful!</h2>
                
                <div class="payment-details">
                    <p><strong>🆔 Payment ID:</strong> ${razorpayResponse.razorpay_payment_id}</p>
                    <p><strong>📋 Plan:</strong> ${planType.charAt(0).toUpperCase() + planType.slice(1)}</p>
                    <p><strong>💰 Amount Paid:</strong> ₹${amount.toLocaleString('en-IN')}</p>
                    <p><strong>✅ Status:</strong> <span style="color: #28a745;">Completed</span></p>
                    <p><strong>🏢 Company:</strong> ${COMPANY_INFO.name}</p>
                </div>
                
                <p style="margin: 20px 0; color: #666;">
                    🎉 Thank you for choosing Growaro Infotech! 
                    Your payment has been processed successfully.
                </p>
                
                <button class="modal-btn btn-success" onclick="closeModal('successModal')">
                    Continue ➡️
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
}

// ❌ Show Error Modal
function showErrorModal(error) {
    const modal = `
        <div id="errorModal" class="payment-modal">
            <div class="modal-content">
                <div class="modal-icon">❌</div>
                <h2 style="color: #dc3545; margin-bottom: 20px;">Payment Failed</h2>
                
                <div class="payment-details">
                    <p><strong>❌ Error:</strong> ${error.description || error.reason || 'Payment processing failed'}</p>
                    <p><strong>🔢 Code:</strong> ${error.code || error.source || 'PAYMENT_ERROR'}</p>
                    <p><strong>📝 Message:</strong> ${error.step || 'Please try again'}</p>
                </div>
                
                <p style="margin: 20px 0; color: #666;">
                    😔 Don't worry! You can try again or contact our support team if the issue persists.
                </p>
                
                <button class="modal-btn btn-danger" onclick="closeModal('errorModal')">
                    Try Again 🔄
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
}

// 🗑️ Close Modal Function
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// 📤 Optional: Send payment data to your server
function sendPaymentToServer(razorpayResponse, planType, amount) {
    console.log('📤 Sending payment data to server...');
    
    const paymentData = {
        payment_id: razorpayResponse.razorpay_payment_id,
        plan_type: planType,
        amount: amount,
        timestamp: new Date().toISOString(),
        customer_info: {
            // Add customer details here
        }
    };
    
    // Example server call (replace with your endpoint)
    /*
    fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ Server response:', data);
    })
    .catch(error => {
        console.error('❌ Server error:', error);
    });
    */
    
    // For now, just store in localStorage (frontend only)
    const paymentHistory = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
    paymentHistory.push(paymentData);
    localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));
    
    console.log('💾 Payment stored locally:', paymentData);
}

// 🔍 Debug function to check Razorpay integration
function debugRazorpayIntegration() {
    console.log('🔍 Razorpay Integration Debug:');
    console.log('- Razorpay library loaded:', typeof Razorpay !== 'undefined');
    console.log('- Key ID:', RAZORPAY_CREDENTIALS.KEY_ID);
    console.log('- Company info:', COMPANY_INFO);
    console.log('- Payment inputs found:', {
        silver: !!document.getElementById('silver-amount-input'),
        gold: !!document.getElementById('gold-amount-input'),
        platinum: !!document.getElementById('platinum-amount-input')
    });
}

// 🚀 Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 Payment integration loaded successfully!');
    console.log('🔑 Using Razorpay Key:', RAZORPAY_CREDENTIALS.KEY_ID);
    
    // Run debug check
    setTimeout(debugRazorpayIntegration, 1000);
    
    // Add input validation to amount fields
    ['silver', 'gold', 'platinum'].forEach(plan => {
        const input = document.getElementById(`${plan}-amount-input`);
        if (input) {
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                if (value < 1) {
                    this.style.borderColor = '#dc3545';
                } else if (value > 999999) {
                    this.style.borderColor = '#ffc107';
                } else {
                    this.style.borderColor = '#28a745';
                }
            });
        }
    });
});

// 📊 Show payment history (for testing)
function showPaymentHistory() {
    const history = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
    console.log('💳 Payment History:', history);
    return history;
}

console.log('💳 Payment.js loaded with custom amount functionality!');
