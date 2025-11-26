// ================================
// MENÚ HAMBURGESA RESPONSIVO
// ================================

const hamburger = document.getElementById('hamburger');
const menu = document.querySelector('.menu');

// Alternar menú en dispositivos móviles
hamburger.addEventListener('click', function() {
    menu.classList.toggle('active');
});

// Cerrar menú cuando se hace clic en un enlace
const menuLinks = document.querySelectorAll('.menu a');
menuLinks.forEach(link => {
    link.addEventListener('click', function() {
        menu.classList.remove('active');
    });
});

// ================================
// CARRUSEL DE NOTICIAS
// ================================

let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const totalSlides = slides.length;
const track = document.querySelector('.carousel-track');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicatorsContainer = document.getElementById('indicators');

// Crear indicadores
function createIndicators() {
    for (let i = 0; i < totalSlides; i++) {
        const indicator = document.createElement('div');
        indicator.classList.add('indicator');
        if (i === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => goToSlide(i));
        indicatorsContainer.appendChild(indicator);
    }
}

// Actualizar posición del carrusel
function updateCarousel() {
    const offset = -currentSlide * 100;
    track.style.transform = `translateX(${offset}%)`;
    
    // Actualizar indicadores
    document.querySelectorAll('.indicator').forEach((ind, index) => {
        ind.classList.toggle('active', index === currentSlide);
    });
}

// Ir a una diapositiva específica
function goToSlide(n) {
    currentSlide = n % totalSlides;
    if (currentSlide < 0) currentSlide = totalSlides - 1;
    updateCarousel();
}

// Siguiente diapositiva
function nextSlide() {
    goToSlide(currentSlide + 1);
}

// Diapositiva anterior
function prevSlide() {
    goToSlide(currentSlide - 1);
}

// Eventos de botones
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Auto-avance cada 5 segundos
let autoSlideTimer = setInterval(nextSlide, 5000);

// Pausar auto-avance en hover
const carouselContainer = document.querySelector('.carousel-container');
carouselContainer.addEventListener('mouseenter', () => {
    clearInterval(autoSlideTimer);
});

carouselContainer.addEventListener('mouseleave', () => {
    autoSlideTimer = setInterval(nextSlide, 5000);
});

// Inicializar indicadores
createIndicators();

// ================================
// CALCULADORA DE IMC
// ================================

const calcBtn = document.getElementById('calcBtn');
const pesoInput = document.getElementById('peso');
const alturaInput = document.getElementById('altura');
const unitSelect = document.getElementById('unitSelect');
const genderSelect = document.getElementById('genderSelect');
const compositionSelect = document.getElementById('compositionSelect');
const resultContainer = document.getElementById('resultContainer');
const imcValue = document.getElementById('imcValue');
const imcCategory = document.getElementById('imcCategory');
const historyContainer = document.getElementById('historyContainer');
const weightHistoryList = document.getElementById('weightHistory');

function calcularIMC() {
    const rawPeso = parseFloat(pesoInput.value);
    const altura = parseFloat(alturaInput.value);
    const unit = unitSelect.value; // 'kg' o 'lb'
    const gender = genderSelect.value;
    const composition = compositionSelect.value;
    let peso = rawPeso;
    // Convertir libras a kilogramos si es necesario
    if (unit === 'lb') {
        peso = +(rawPeso * 0.45359237).toFixed(2);
    }
    
    // Validar entrada
    if (isNaN(rawPeso) || isNaN(altura) || rawPeso <= 0 || altura <= 0) {
        mostrarAlerta('Por favor ingresa valores válidos', 'error');
        return;
    }
    
    // Calcular IMC (usar peso en kg ya convertido)
    const imc = +(peso / (altura * altura)).toFixed(1);
    
    // Determinar categoría
    let categoria = '';
    let color = '';
    
    if (imc < 18.5) {
        categoria = 'Bajo peso - Necesitas aumentar tu consumo calórico';
        color = '#3498db';
    } else if (imc >= 18.5 && imc < 25) {
        categoria = 'Peso normal - ¡Sigue así! Mantén tu estilo de vida saludable';
        color = '#2ecc71';
    } else if (imc >= 25 && imc < 30) {
        categoria = 'Sobrepeso - Considera aumentar tu actividad física';
        color = '#f39c12';
    } else {
        categoria = 'Obesidad - Consulta con un profesional de salud';
        color = '#e74c3c';
    }
    
    // Mostrar resultado
    imcValue.textContent = imc;
    imcCategory.textContent = categoria;
    imcCategory.style.color = color;
    imcValue.style.color = color;
    resultContainer.style.display = 'block';

    // Guardar registro de peso (usamos el valor original que ingresó el usuario con su unidad)
    try {
        const key = `weight_history_${gender}_${composition}_${unit}`;
        const stored = localStorage.getItem(key);
        const list = stored ? JSON.parse(stored) : [];
        list.unshift({ value: rawPeso, unit: unit, kg: peso, date: new Date().toISOString() });
        // Limitar a últimos 20 registros
        const trimmed = list.slice(0, 20);
        localStorage.setItem(key, JSON.stringify(trimmed));

        // Mostrar historial para esta combinación
        renderHistory(key, trimmed);
    } catch (e) {
        console.error('No se pudo guardar el registro:', e);
    }
}

calcBtn.addEventListener('click', calcularIMC);

// Permitir calcular con Enter
pesoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calcularIMC();
});

alturaInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calcularIMC();
});

// Actualizar placeholder/label del campo peso cuando cambie la unidad
unitSelect.addEventListener('change', () => {
    const unit = unitSelect.value;
    const label = document.querySelector('label[for="peso"]');
    if (label) label.textContent = `Peso (${unit})`;
    pesoInput.placeholder = unit === 'kg' ? 'Ej: 70' : 'Ej: 154';
});

// Renderizar historial en el DOM
function renderHistory(key, list) {
    weightHistoryList.innerHTML = '';
    if (!list || list.length === 0) {
        weightHistoryList.innerHTML = '<li>No hay registros previos.</li>';
    } else {
        list.forEach(item => {
            const li = document.createElement('li');
            const date = new Date(item.date);
            li.textContent = `${item.value} ${item.unit} — ${date.toLocaleString()} `;
            weightHistoryList.appendChild(li);
        });
    }
    historyContainer.style.display = 'block';
}

// Si el usuario ha usado la combinación antes, podemos precargar el historial al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    try {
        const unit = unitSelect.value;
        const gender = genderSelect.value;
        const composition = compositionSelect.value;
        const key = `weight_history_${gender}_${composition}_${unit}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            renderHistory(key, JSON.parse(stored));
        }
    } catch (e) {
        // no crítico
    }
});

// ================================
// PREGUNTAS FRECUENTES (FAQ)
// ================================

const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
        const faqItem = this.parentElement;
        
        // Cerrar otros items abiertos
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('active');
            }
        });
        
        // Toggle del item actual
        faqItem.classList.toggle('active');
    });
});

// ================================
// BOTÓN CTA (CALL TO ACTION)
// ================================

const ctaButton = document.querySelector('.cta-button');
if (ctaButton && !ctaButton.getAttribute('href')) {
    // Si es un botón (no un enlace)
    ctaButton.addEventListener('click', function() {
        const nutrientesSection = document.getElementById('nutrientes');
        nutrientesSection.scrollIntoView({ behavior: 'smooth' });
    });
}

// ================================
// FORMULARIO DE CONTACTO
// ================================

const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Obtener valores del formulario
    const nombre = this.querySelector('input[type="text"]').value.trim();
    const email = this.querySelector('input[type="email"]').value.trim();
    const mensaje = this.querySelector('textarea').value.trim();
    
    // Validar que los campos no estén vacíos
    if (nombre === '' || email === '' || mensaje === '') {
        mostrarAlerta('Por favor completa todos los campos', 'error');
        return;
    }
    
    // Validar formato de email
    if (!validarEmail(email)) {
        mostrarAlerta('Por favor ingresa un email válido', 'error');
        return;
    }
    
    // Simular envío del formulario
    mostrarAlerta('¡Gracias por tu mensaje! Nos contactaremos pronto.', 'success');
    
    // Limpiar formulario
    this.reset();
});

// Función para validar email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo) {
    // Crear elemento de alerta
    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`;
    alerta.textContent = mensaje;
    
    // Estilos de alerta
    alerta.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: bold;
        z-index: 2000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    `;
    
    // Colores según tipo
    if (tipo === 'success') {
        alerta.style.backgroundColor = '#2ecc71';
        alerta.style.color = 'white';
    } else if (tipo === 'error') {
        alerta.style.backgroundColor = '#e74c3c';
        alerta.style.color = 'white';
    }
    
    // Agregar alerta al documento
    document.body.appendChild(alerta);
    
    // Remover alerta después de 3 segundos
    setTimeout(() => {
        alerta.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            alerta.remove();
        }, 300);
    }, 3000);
}

// ================================
// SCROLL SUAVE Y EFECTOS
// ================================

// Efectos de scroll en elementos
window.addEventListener('scroll', function() {
    // Cambiar color del encabezado en scroll
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// ================================
// ANIMACIÓN DE TARJETAS AL ENTRAR EN VISTA
// ================================

// Opciones para el Intersection Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

// Crear Intersection Observer
const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            entry.target.style.opacity = '0';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar todas las tarjetas
const cards = document.querySelectorAll('.nutrient-card, .info-box, .tip-card, .recipe-card, .news-card');
cards.forEach(card => {
    observer.observe(card);
});

// Tarjetas de receta: permitir expandir/colapsar al tocar/clicar y con teclado (Enter/Espacio)
function initRecipeCards() {
    const recipeCards = document.querySelectorAll('.recipe-card');
    recipeCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Evitar que click en enlaces u otros controles internos colapse
            if (e.target.tagName.toLowerCase() === 'a' || e.target.closest('.no-toggle')) return;
            card.classList.toggle('expanded');
            const expanded = card.classList.contains('expanded');
            card.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.classList.toggle('expanded');
                const expanded = card.classList.contains('expanded');
                card.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            }
        });
    });
}

// Inicializar cuando DOM listo
window.addEventListener('DOMContentLoaded', initRecipeCards);

// ================================
// MEJORAS DE ACCESIBILIDAD
// ================================

// Mantener consistencia del estado del menú en redimensionamiento
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        menu.classList.remove('active');
    }
});

// ================================
// SMOOTH SCROLL PARA NAVEGADORES SIN SOPORTE
// ================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ================================
// AÑADIR ANIMACIÓN KEYFRAMES DINÁMICAMENTE
// ================================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(50px);
        }
    }
`;
document.head.appendChild(style);

// ================================
// INFORMACIÓN DE CONTACTO EN CONSOLA
// ================================

console.log('%c¡Bienvenido a la Página de Nutrición Saludable!', 'color: #2ecc71; font-size: 20px; font-weight: bold;');
console.log('%cPara más información sobre nutrición, consulta con un profesional.', 'color: #27ae60; font-size: 14px;');

