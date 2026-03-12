/**
 * Calmionix Creator Hub - JavaScript
 * Interactive features and animations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initLoadingScreen();
    initNavbar();
    initClock();
    initCountUp();
    initJadwal();
    initFAQ();
    initScrollAnimations();
    initSmoothScroll();
});

/**
 * Loading Screen
 * Shows loading animation for 1.5 seconds then fades out
 */
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        // Remove from DOM after animation
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1500);
}

/**
 * Navbar
 * - Sticky navbar with background on scroll
 * - Mobile menu toggle
 * - Active link highlighting
 */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky navbar effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Animate hamburger to X
        const spans = navToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // Active link based on scroll position
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/**
 * Real-time Clock (WIB Timezone)
 * Updates every second
 */
function initClock() {
    const clockDate = document.getElementById('clock-date');
    const clockTime = document.getElementById('clock-time');

    function updateClock() {
        // Create date in WIB timezone (UTC+7)
        const now = new Date();
        const wibTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));

        // Format date
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        
        const dayName = days[wibTime.getDay()];
        const date = wibTime.getDate();
        const month = months[wibTime.getMonth()];
        const year = wibTime.getFullYear();

        // Format time
        const hours = String(wibTime.getHours()).padStart(2, '0');
        const minutes = String(wibTime.getMinutes()).padStart(2, '0');
        const seconds = String(wibTime.getSeconds()).padStart(2, '0');

        clockDate.textContent = `${dayName}, ${date} ${month} ${year}`;
        clockTime.textContent = `${hours}:${minutes}:${seconds} WIB`;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

/**
 * Count Up Animation for Statistics
 * Animates numbers from 0 to target value
 */
function initCountUp() {
    const statCards = document.querySelectorAll('.stat-card');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const target = parseInt(card.dataset.target);
                const element = card.querySelector('.stat-number');
                
                animateCountUp(element, target);
                observer.unobserve(card);
            }
        });
    }, observerOptions);

    statCards.forEach(card => observer.observe(card));
}

function animateCountUp(element, target) {
    const duration = 2000; // 2 seconds
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const current = Math.floor(start + (target - start) * easeOut);
        
        // Format number with K for thousands
        if (target >= 1000) {
            element.textContent = (current / 1000).toFixed(current >= 10000 ? 0 : 1) + 'K';
        } else {
            element.textContent = current;
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            // Final value
            if (target >= 1000) {
                element.textContent = (target / 1000).toFixed(target >= 10000 ? 0 : 1) + 'K';
            } else {
                element.textContent = target;
            }
        }
    }

    requestAnimationFrame(update);
}

/**
 * Jadwal Endorse Server - Professional Booking System
 * - Reads data from schedule.json
 * - Auto-calculates status (UPCOMING, HARI INI, SELESAI)
 * - Shows statistics dashboard
 * - Displays available slots
 */
async function initJadwal() {
    const jadwalContainer = document.getElementById('jadwal-container');
    const slotContainer = document.getElementById('slot-container');
    const totalAntrianEl = document.getElementById('total-antrian');
    const slotTersediaEl = document.getElementById('slot-tersedia');
    const uploadBerikutnyaEl = document.getElementById('upload-berikutnya');

    // Fallback data in case fetch fails
    const fallbackData = [
        { date: '2026-03-12', day: 'Kamis', server: 'Stecu SMP', platform: 'TikTok', time: '18:00' },
        { date: '2026-03-13', day: 'Jumat', server: 'Natural SMP', platform: 'TikTok', time: '18:00' },
        { date: '2026-03-14', day: 'Sabtu', server: 'Potato SMP', platform: 'TikTok', time: '18:00' },
        { date: '2026-03-15', day: 'Minggu', server: 'Hypix', platform: 'TikTok', time: '18:00' },
        { date: '2026-03-16', day: 'Senin', server: 'Trinity Indonesia', platform: 'TikTok', time: '18:00' },
        { date: '2026-03-17', day: 'Selasa', server: 'Nexoverse', platform: 'TikTok + YouTube', time: '18:00' },
        { date: '2026-03-18', day: 'Rabu', server: 'Nexoverse', platform: 'TikTok', time: '18:00' },
        { date: '2026-03-27', day: 'Senin', server: 'Survborn', platform: 'TikTok', time: '18:00' },
        { date: '2026-03-27', day: 'Jumat', server: 'Iciki Network', platform: 'TikTok', time: '18:00' }
    ];

    let scheduleData = fallbackData;

    try {
        // Fetch schedule data from JSON
        const response = await fetch(`data/schedule.json?v=${Date.now()}`, {
    cache: "no-store"
});
        if (response.ok) {
            scheduleData = await response.json();
        }

        // Process and render using the shared function
        processScheduleData(scheduleData, jadwalContainer, slotContainer, totalAntrianEl, slotTersediaEl, uploadBerikutnyaEl);

    } catch (error) {
        console.log('Using fallback data for schedule');
        // Use fallback data and continue processing
        processScheduleData(fallbackData, jadwalContainer, slotContainer, totalAntrianEl, slotTersediaEl, uploadBerikutnyaEl);
    }
}

/**
 * Process Schedule Data and Render
 */
function processScheduleData(scheduleData, jadwalContainer, slotContainer, totalAntrianEl, slotTersediaEl, uploadBerikutnyaEl) {
    // Get current date in WIB
    const now = new Date();
    const wibTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const today = formatDate(wibTime);

    // Process schedule data with status
    const processedData = scheduleData.map(item => {
        const itemDate = new Date(item.date);
        const itemDateStr = formatDate(itemDate);
        const diffTime = itemDate - wibTime;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let status;
        if (itemDateStr === today) {
            status = 'HARI INI';
        } else if (diffDays < 0) {
            status = 'SELESAI';
        } else {
            status = 'UPCOMING';
        }

        return { ...item, status, diffDays };
    });

    // Filter out completed schedules
    const activeSchedules = processedData.filter(item => item.status !== 'SELESAI');

    // Calculate statistics
    const totalAntrian = activeSchedules.length;
    const maxSlotsPerWeek = 20;
    const slotTersedia = Math.max(0, maxSlotsPerWeek - totalAntrian);
    const nextUpload = activeSchedules.length > 0 ? activeSchedules[0] : null;

    // Update statistics display
    if (totalAntrianEl) totalAntrianEl.textContent = `${totalAntrian} Server`;
    if (slotTersediaEl) slotTersediaEl.textContent = `${slotTersedia} Slot`;
    if (uploadBerikutnyaEl && nextUpload) {
        uploadBerikutnyaEl.innerHTML = `${nextUpload.server}<br><small>${formatDisplayDateShort(new Date(nextUpload.date))}</small>`;
    }

    // Render schedule cards
    jadwalContainer.innerHTML = '';
    if (activeSchedules.length === 0) {
        jadwalContainer.innerHTML = `
            <div class="jadwal-empty">
                <div class="jadwal-empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h3>Tidak Ada Jadwal</h3>
                <p>Saat ini tidak ada jadwal endorse yang akan datang.</p>
                <a href="https://wa.me/6282130570915" target="_blank" class="btn-primary">Order Endorse Sekarang</a>
            </div>
        `;
    } else {
        activeSchedules.forEach((item, index) => {
            const card = createScheduleCard(item, index);
            jadwalContainer.appendChild(card);
        });
    }

    // Generate and render available slots
    const availableSlots = generateAvailableSlots(wibTime, scheduleData, slotTersedia);
    slotContainer.innerHTML = '';
    if (availableSlots.length === 0) {
        slotContainer.innerHTML = `
            <div class="jadwal-empty" style="grid-column: 1 / -1;">
                <div class="jadwal-empty-icon" style="background: rgba(0, 255, 136, 0.1); color: var(--accent-green);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <h3>Slot Penuh</h3>
                <p>Semua slot untuk minggu ini sudah terisi.</p>
                <p style="color: var(--accent-green); margin-top: 10px;">Hubungi kami untuk info slot minggu depan.</p>
            </div>
        `;
    } else {
        availableSlots.forEach(slot => {
            const slotCard = createSlotCard(slot);
            slotContainer.appendChild(slotCard);
        });
    }
}

/**
 * Create Schedule Card Element
 */
function createScheduleCard(item, index) {
    const card = document.createElement('div');
    card.className = `jadwal-card status-${item.status.toLowerCase().replace(' ', '-')} fade-in`;
    card.style.animationDelay = `${index * 0.1}s`;

    const statusBadge = item.status === 'HARI INI' 
        ? '<span class="jadwal-status-badge today">🔥 HARI INI</span>'
        : '<span class="jadwal-status-badge upcoming">UPCOMING</span>';

    const platformIcons = getPlatformIcons(item.platform);

    card.innerHTML = `
        ${statusBadge}
        <div class="jadwal-card-header">
            <div class="jadwal-day">${item.day}</div>
            <div class="jadwal-date">${formatDisplayDate(new Date(item.date))}</div>
        </div>
        <div class="jadwal-card-body">
            <div class="jadwal-server">${item.server}</div>
            <div class="jadwal-info">
                <div class="jadwal-info-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <span>Upload: ${item.time} WIB</span>
                </div>
            </div>
        </div>
        <div class="jadwal-card-footer">
            <div class="jadwal-platform">
                ${platformIcons}
                <span>${item.platform || 'TikTok'}</span>
            </div>
        </div>
    `;

    return card;
}

/**
 * Create Slot Card Element
 */
function createSlotCard(slot) {
    const card = document.createElement('div');
    card.className = 'slot-card fade-in';

    card.innerHTML = `
        <div class="slot-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
        <div class="slot-date">${slot.date}</div>
        <div class="slot-day">${slot.day}</div>
        <a href="https://wa.me/6282130570915?text=Halo%20Calmionix%2C%20saya%20mau%20ambil%20slot%20endorse%20tanggal%20${encodeURIComponent(slot.date)}" target="_blank" class="slot-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Ambil Slot
        </a>
    `;

    return card;
}

/**
 * Generate Available Slots
 */
function generateAvailableSlots(currentDate, bookedSchedules, maxSlots) {
    const slots = [];
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const bookedDates = bookedSchedules.map(s => s.date);
    
    // Start from tomorrow
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() + 1);
    
    // Generate slots for next 30 days
    let generatedCount = 0;
    for (let i = 0; i < 30 && generatedCount < maxSlots; i++) {
        const checkDate = new Date(startDate);
        checkDate.setDate(checkDate.getDate() + i);
        
        const dateStr = formatDate(checkDate);
        const dayName = days[checkDate.getDay()];
        
        // Skip if already booked
        if (!bookedDates.includes(dateStr)) {
            slots.push({
                date: formatDisplayDateShort(checkDate),
                day: dayName,
                fullDate: dateStr
            });
            generatedCount++;
        }
    }
    
    return slots;
}

/**
 * Get Platform Icons SVG
 */
function getPlatformIcons(platform) {
    if (!platform) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`;
    }
    
    if (platform.includes('TikTok') && platform.includes('YouTube')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`;
    }
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`;
}

/**
 * Format Date to YYYY-MM-DD
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format Date to Display (12 Maret 2026)
 */
function formatDisplayDate(date) {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format Date to Short Display (12 Mar)
 */
function formatDisplayDateShort(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
                   'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * FAQ Accordion
 * Toggle answer visibility on click
 */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

/**
 * Scroll Animations
 * Fade in elements when they come into view
 */
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.stat-card, .stat-box, .jadwal-card, .slot-card, .portfolio-card, .price-card, .komunitas-card, .faq-item');
    
    // Add fade-in class to elements
    fadeElements.forEach(el => {
        el.classList.add('fade-in');
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));
}

/**
 * Smooth Scroll
 * Smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const navbarHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Parallax Effect for Hero Glow
 * Subtle parallax on mouse move
 */
document.addEventListener('mousemove', (e) => {
    const glow1 = document.querySelector('.hero-glow');
    const glow2 = document.querySelector('.hero-glow-2');
    
    if (glow1 && glow2 && window.innerWidth > 768) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        glow1.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
        glow2.style.transform = `translate(${-x * 20}px, ${-y * 20}px)`;
    }
});

/**
 * Button Click Effects
 * Add ripple effect to buttons
 */
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

/**
 * Preload Images
 * Preload important images for better performance
 */
function preloadImages() {
    const images = [
        'assets/logo/logo-calmionix.png',
        'https://img.youtube.com/vi/UI2Ahpt_wzw/maxresdefault.jpg',
        'https://img.youtube.com/vi/XqcqkOP6jXI/maxresdefault.jpg',
        'https://img.youtube.com/vi/IphMg209DCE/maxresdefault.jpg'
    ];

    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

const music = document.getElementById("bgMusic");
const btn = document.getElementById("musicBtn");

music.volume = 0.2;

btn.addEventListener("click", () => {
    if (music.paused) {
        music.play();
        btn.textContent = "🔊";
    } else {
        music.pause();
        btn.textContent = "🔇";
    }
});

// Preload images after page load
window.addEventListener('load', preloadImages);
