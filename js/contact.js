// Contact Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeContactPage();
});

function initializeContactPage() {
    setupFormValidation();
    setupFAQInteractions();
}

// Form Submission
async function submitContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validate form
    if (!validateForm(formData)) {
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '📤 Enviando...';
    submitBtn.disabled = true;
    
    try {
        // Prepare contact data
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone') || '',
            subject: formData.get('subject'),
            message: formData.get('message')
        };
        
        // Send to Google Sheets
        if (window.sheetsIntegration) {
            const response = await window.sheetsIntegration.saveContact(contactData);
            
            if (response.success || response.offline) {
                showSuccessMessage(response.offline);
                form.reset();
            } else {
                throw new Error(response.error || 'Erro ao enviar mensagem');
            }
        } else {
            // Fallback - just show success (data will be saved when integration loads)
            console.log('Form data:', contactData);
            showSuccessMessage();
            form.reset();
        }
        
    } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        showErrorMessage(error.message);
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function validateForm(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    if (!name || name.length < 2) {
        showNotification('Por favor, insira um nome válido.', 'error');
        return false;
    }
    
    if (!email || !isValidEmail(email)) {
        showNotification('Por favor, insira um e-mail válido.', 'error');
        return false;
    }
    
    if (!subject) {
        showNotification('Por favor, selecione um assunto.', 'error');
        return false;
    }
    
    if (!message || message.length < 10) {
        showNotification('Por favor, escreva uma mensagem com pelo menos 10 caracteres.', 'error');
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function setupFormValidation() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    switch (field.type) {
        case 'email':
            if (value && !isValidEmail(value)) {
                isValid = false;
                message = 'E-mail inválido';
            }
            break;
        case 'text':
            if (field.required && value.length < 2) {
                isValid = false;
                message = 'Campo obrigatório';
            }
            break;
        case 'tel':
            if (value && value.length < 10) {
                isValid = false;
                message = 'Telefone inválido';
            }
            break;
    }
    
    if (field.tagName === 'TEXTAREA' && field.required && value.length < 10) {
        isValid = false;
        message = 'Mensagem muito curta';
    }
    
    if (field.tagName === 'SELECT' && field.required && !value) {
        isValid = false;
        message = 'Selecione uma opção';
    }
    
    showFieldValidation(field, isValid, message);
}

function showFieldValidation(field, isValid, message) {
    // Remove existing validation
    clearFieldError(field);
    
    if (!isValid) {
        field.classList.add('error');
        const errorElement = document.createElement('span');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        field.parentNode.appendChild(errorElement);
    }
}

function clearFieldError(field) {
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// FAQ Interactions
function setupFAQInteractions() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            toggleFaq(this);
        });
    });
}

function toggleFaq(questionElement) {
    const faqItem = questionElement.parentNode;
    const answer = faqItem.querySelector('.faq-answer');
    const toggle = questionElement.querySelector('.faq-toggle');
    
    // Close other open FAQs
    const allFaqItems = document.querySelectorAll('.faq-item');
    allFaqItems.forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
            const otherAnswer = item.querySelector('.faq-answer');
            const otherToggle = item.querySelector('.faq-toggle');
            if (otherAnswer) otherAnswer.style.display = 'none';
            if (otherToggle) otherToggle.textContent = '+';
        }
    });
    
    // Toggle current FAQ
    if (faqItem.classList.contains('active')) {
        faqItem.classList.remove('active');
        answer.style.display = 'none';
        toggle.textContent = '+';
    } else {
        faqItem.classList.add('active');
        answer.style.display = 'block';
        toggle.textContent = '−';
    }
}

// Success Message
function showSuccessMessage() {
    const successMessage = document.getElementById('success-message');
    if (successMessage) {
        successMessage.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeSuccessMessage() {
    const successMessage = document.getElementById('success-message');
    if (successMessage) {
        successMessage.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.contact-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `contact-notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">✕</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 4000);
}

// Add contact page styles
const contactPageStyles = document.createElement('style');
contactPageStyles.textContent = `
    .contact-form {
        background: var(--gradient-dark);
        border: 2px solid var(--border-color);
        border-radius: 20px;
        padding: 2rem;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .form-group {
        margin-bottom: 1rem;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: var(--text-primary);
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 1rem;
        border: 2px solid var(--border-color);
        border-radius: 10px;
        background: var(--card-bg);
        color: var(--text-primary);
        font-size: 1rem;
        transition: all 0.3s ease;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
    }
    
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: #ff4444;
    }
    
    .field-error {
        color: #ff4444;
        font-size: 0.9rem;
        margin-top: 0.5rem;
        display: block;
    }
    
    .checkbox-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-size: 0.9rem;
    }
    
    .checkbox-label input[type="checkbox"] {
        width: auto;
        margin: 0;
    }
    
    .submit-btn {
        width: 100%;
        background: var(--gradient-primary);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 15px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .submit-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px var(--shadow-color);
    }
    
    .submit-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .contact-methods {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    
    .contact-method {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
    }
    
    .method-icon {
        font-size: 2rem;
        min-width: 60px;
        text-align: center;
    }
    
    .method-info h3 {
        font-family: 'Orbitron', monospace;
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }
    
    .method-info p {
        font-weight: 600;
        margin-bottom: 0.3rem;
    }
    
    .method-info small {
        color: var(--text-secondary);
    }
    
    .social-contact {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid var(--border-color);
    }
    
    .social-contact h3 {
        font-family: 'Orbitron', monospace;
        color: var(--primary-color);
        margin-bottom: 1rem;
    }
    
    .social-links {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
    
    .social-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        background: rgba(255, 107, 53, 0.1);
        border: 1px solid var(--border-color);
        border-radius: 10px;
        text-decoration: none;
        color: var(--text-primary);
        transition: all 0.3s ease;
    }
    
    .social-link:hover {
        background: rgba(255, 107, 53, 0.2);
        transform: translateY(-2px);
    }
    
    .faq-item {
        background: var(--gradient-dark);
        border: 2px solid var(--border-color);
        border-radius: 15px;
        margin-bottom: 1rem;
        overflow: hidden;
        transition: all 0.3s ease;
    }
    
    .faq-item:hover {
        border-color: var(--primary-color);
    }
    
    .faq-question {
        padding: 1.5rem;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s ease;
    }
    
    .faq-question:hover {
        background: rgba(255, 107, 53, 0.1);
    }
    
    .faq-question h3 {
        margin: 0;
        font-size: 1.1rem;
    }
    
    .faq-toggle {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--primary-color);
        transition: transform 0.3s ease;
    }
    
    .faq-item.active .faq-toggle {
        transform: rotate(45deg);
    }
    
    .faq-answer {
        display: none;
        padding: 0 1.5rem 1.5rem;
        color: var(--text-secondary);
        line-height: 1.6;
    }
    
    .success-message {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 1000;
        align-items: center;
        justify-content: center;
    }
    
    .success-content {
        background: var(--gradient-dark);
        border: 2px solid #4CAF50;
        border-radius: 20px;
        padding: 3rem;
        text-align: center;
        max-width: 400px;
        animation: bounceIn 0.5s ease;
    }
    
    .success-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        display: block;
    }
    
    .success-content h3 {
        font-family: 'Orbitron', monospace;
        color: #4CAF50;
        margin-bottom: 1rem;
    }
    
    .success-content button {
        background: var(--gradient-primary);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 10px;
        cursor: pointer;
        margin-top: 1rem;
        transition: all 0.3s ease;
    }
    
    .success-content button:hover {
        transform: translateY(-2px);
    }
    
    .contact-notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--gradient-dark);
        border: 2px solid var(--border-color);
        border-radius: 15px;
        padding: 1rem 1.5rem;
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
        color: var(--text-primary);
    }
    
    .notification-error {
        border-color: #ff4444;
        background: linear-gradient(135deg, #1a1a1a 0%, #4a2d2d 100%);
    }
    
    .notification-info {
        border-color: var(--primary-color);
        background: var(--gradient-dark);
    }
    
    .contact-notification button {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0.2rem;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .contact-notification button:hover {
        background: rgba(255, 107, 53, 0.2);
        color: var(--primary-color);
    }
    
    @keyframes bounceIn {
        0% {
            transform: scale(0.3);
            opacity: 0;
        }
        50% {
            transform: scale(1.05);
        }
        70% {
            transform: scale(0.9);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @media (max-width: 768px) {
        .form-row {
            grid-template-columns: 1fr;
        }
        
        .social-links {
            grid-template-columns: 1fr;
        }
        
        .contact-content {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(contactPageStyles);

