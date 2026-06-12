document.addEventListener('DOMContentLoaded', () => {
    // Check session login status
    if (sessionStorage.getItem('logged_in') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Dynamic greeting & logout configuration
    const userGreeting = document.getElementById('user-greeting');
    const logoutBtn = document.getElementById('logout-btn');
    const isGuest = sessionStorage.getItem('is_guest') === 'true';

    if (isGuest) {
        userGreeting.textContent = "Hello, Guest!";
        logoutBtn.textContent = "Sign Up / Login";
        logoutBtn.style.borderColor = "#38bdf8";
        logoutBtn.style.color = "#38bdf8";
    } else {
        const username = sessionStorage.getItem('username') || 'User';
        userGreeting.textContent = `Hello, ${username}!`;
        logoutBtn.textContent = "Logout";
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('logged_in');
            sessionStorage.removeItem('is_guest');
            sessionStorage.removeItem('username');
            window.location.href = 'login.html';
        });
    }

    const form = document.getElementById('calculator-form');
    const calcSection = document.querySelector('.calculator-section');
    const resultsSection = document.getElementById('results-section');
    const calculateBtn = document.getElementById('calculate-btn');
    const resetBtn = document.getElementById('reset-btn');

    const totalEl = document.getElementById('total-co2');
    const transportEl = document.getElementById('res-transport');
    const energyEl = document.getElementById('res-energy');
    const dietEl = document.getElementById('res-diet');

    // Constants for carbon footprint calculations (converted to per-kilometer, matching 1 mile = 1.60934 km)
    const CAR_KM_CO2 = 0.251;
    const BUS_KM_CO2 = 0.055;
    const FLIGHT_KM_CO2 = 0.152;

    const ELECTRICITY_KWH_CO2 = 0.385;

    const MEAT_HEAVY_CO2 = 7.2;
    const AVERAGE_DIET_CO2 = 5.6;
    const VEGETARIAN_CO2 = 3.8;
    const VEGAN_CO2 = 2.9;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const carKmVal = document.getElementById('carKm').value.trim();
        const busKmVal = document.getElementById('busKm').value.trim();
        const flightKmVal = document.getElementById('flightKm').value.trim();
        const electricityVal = document.getElementById('electricity').value.trim();
        const calcErrorBox = document.getElementById('calc-error-box');

        // Hide any previous errors
        calcErrorBox.classList.add('hidden');

        // Validate empty fields
        if (carKmVal === "" || busKmVal === "" || flightKmVal === "" || electricityVal === "") {
            calcErrorBox.textContent = "Please fill in all transportation and electricity fields. Enter 0 if you do not use them.";
            calcErrorBox.classList.remove('hidden');
            return;
        }

        // Validate negative numbers
        if (parseFloat(carKmVal) < 0 || parseFloat(busKmVal) < 0 || parseFloat(flightKmVal) < 0 || parseFloat(electricityVal) < 0) {
            calcErrorBox.textContent = "Values cannot be negative. Please enter positive numbers or 0.";
            calcErrorBox.classList.remove('hidden');
            return;
        }

        // Add visual loading state briefly for micro-animation effect
        calculateBtn.classList.add('loading');
        calculateBtn.disabled = true;

        setTimeout(() => {
            // Gather data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                // Extract and parse inputs in Kilometers
                const carKm = parseFloat(data.carKm || 0);
                const busKm = parseFloat(data.busKm || 0);
                const flightKm = parseFloat(data.flightKm || 0);
                const electricity = parseFloat(data.electricity || 0);
                const dietType = data.dietType || 'average';

                // Calculate transportation footprint (monthly to annual, using km constants)
                const transportCO2 = (
                    (carKm * CAR_KM_CO2) +
                    (busKm * BUS_KM_CO2) +
                    (flightKm * FLIGHT_KM_CO2)
                ) * 12;

                // Calculate energy footprint (monthly to annual)
                const energyCO2 = (electricity * ELECTRICITY_KWH_CO2) * 12;

                // Calculate diet footprint (daily to annual)
                let dietCO2Daily = AVERAGE_DIET_CO2;
                if (dietType === 'meat-heavy') dietCO2Daily = MEAT_HEAVY_CO2;
                else if (dietType === 'vegetarian') dietCO2Daily = VEGETARIAN_CO2;
                else if (dietType === 'vegan') dietCO2Daily = VEGAN_CO2;
                const dietCO2 = dietCO2Daily * 365;

                const totalCO2 = transportCO2 + energyCO2 + dietCO2;

                const results = {
                    transportation: parseFloat(transportCO2.toFixed(2)),
                    energy: parseFloat(energyCO2.toFixed(2)),
                    diet: parseFloat(dietCO2.toFixed(2)),
                    total: parseFloat(totalCO2.toFixed(2))
                };

                displayResults(results);

            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during calculations. Please verify your inputs.');
            } finally {
                calculateBtn.classList.remove('loading');
                calculateBtn.disabled = false;
            }
        }, 600); // 600ms micro-delay for smooth glass transition
    });

    resetBtn.addEventListener('click', () => {
        resultsSection.classList.add('hidden');
        calcSection.classList.remove('hidden');
        document.getElementById('calc-error-box').classList.add('hidden');
        form.reset();
    });

    function displayResults(data) {
        // Hide form, show results
        calcSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');

        // Animate total number
        animateValue(totalEl, 0, data.total, 1200);
        
        // Set breakdown values
        transportEl.textContent = data.transportation.toLocaleString() + ' kg';
        energyEl.textContent = data.energy.toLocaleString() + ' kg';
        dietEl.textContent = data.diet.toLocaleString() + ' kg';

        // Update Ecological Safety Level Card
        const safetyBadge = document.getElementById('safety-badge');
        const safetyIcon = document.getElementById('safety-icon');
        const safetyLevelTitle = document.getElementById('safety-level-title');
        const safetyDesc = document.getElementById('safety-desc');
        const safetyBar = document.getElementById('safety-bar');

        const total = data.total;
        let badgeText, icon, levelTitle, desc, barWidth, barColor, badgeBg, badgeColor;

        if (total < 2000) {
            badgeText = "Sustainable";
            icon = "🌱";
            levelTitle = "Climate Champion";
            desc = "Excellent! Your footprint is under the sustainable 2,000 kg threshold. If everyone on Earth shared this rate, we would successfully prevent temperatures rising past the critical 1.5°C Paris Agreement limit.";
            barWidth = Math.max((total / 2000) * 20, 5); // Max 20%
            barColor = "#10b981"; // Green
            badgeBg = "rgba(16, 185, 129, 0.2)";
            badgeColor = "#10b981";
        } else if (total <= 8000) {
            badgeText = "Moderate";
            icon = "⚡";
            levelTitle = "Transition Level";
            desc = "Your carbon footprint is moderate. It is lower than the Western average, but still exceeds sustainable boundaries. Trimming vehicle usage by 160 km/month or opting for 2 plant-based days/week will push you into the green zone.";
            barWidth = 20 + ((total - 2000) / 6000) * 30; // 20% to 50%
            barColor = "#f59e0b"; // Yellow/Amber
            badgeBg = "rgba(245, 158, 11, 0.2)";
            badgeColor = "#fbbf24";
        } else if (total <= 16000) {
            badgeText = "High Impact";
            icon = "🚗";
            levelTitle = "Elevated Footprint";
            desc = "Your emissions are high. This footprint represents significant car driving or high energy habits. Adopting micro-habits—like reducing electric usage by 100 kWh or using public transit—can yield immediate carbon savings.";
            barWidth = 50 + ((total - 8000) / 8000) * 30; // 50% to 80%
            barColor = "#f97316"; // Orange
            badgeBg = "rgba(249, 115, 22, 0.2)";
            badgeColor = "#f97316";
        } else {
            badgeText = "Critical / Unsafe";
            icon = "⚠️";
            levelTitle = "Extremely Unsafe";
            desc = "Your carbon footprint exceeds 16,000 kg. This represents a critical impact on Earth's ecosystems. Shift dietary habits to plant-based choices, audit your heating systems, and curtail high-mileage car driving.";
            barWidth = Math.min(80 + ((total - 16000) / 10000) * 20, 100); // 80% to 100%
            barColor = "#f43f5e"; // Rose Red
            badgeBg = "rgba(244, 63, 94, 0.2)";
            badgeColor = "#f43f5e";
        }

        // Apply styles and text updates
        safetyBadge.textContent = badgeText;
        safetyBadge.style.backgroundColor = badgeBg;
        safetyBadge.style.color = badgeColor;
        
        safetyIcon.textContent = icon;
        safetyLevelTitle.textContent = levelTitle;
        safetyDesc.textContent = desc;

        // Set bar attributes
        safetyBar.style.width = barWidth + "%";
        safetyBar.style.backgroundColor = barColor;
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            obj.innerHTML = (start + easeProgress * (end - start)).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
        };
        window.requestAnimationFrame(step);
    }
});
