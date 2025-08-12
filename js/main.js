import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

document.addEventListener("DOMContentLoaded", function () {
  const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

  async function getMessMenu() {
    const menuList = document.getElementById("mess-menu-list");
    if (!menuList) return;

    const dayIndex = new Date().getDay();
    const dayOfWeek = dayIndex === 0 ? 7 : dayIndex;

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = days[dayIndex];

    const { data, error } = await supabase
      .from("mess_menu")
      .select("*")
      .eq("day_of_week", dayOfWeek);

    if (error) {
      console.error("Error fetching mess menu:", error);
      menuList.innerHTML = "<li>Error loading menu.</li>";
      return;
    }

    if (data && data.length > 0) {
      menuList.innerHTML = "";

      const dayElement = document.createElement("li");
      dayElement.textContent = dayName;
      dayElement.style.fontWeight = "bold";
      dayElement.style.textAlign = "center";
      dayElement.style.fontSize = "1.1em";
      dayElement.style.marginBottom = "10px";
      menuList.appendChild(dayElement);

      data.forEach((item) => {
        const menuItem = document.createElement("li");
        menuItem.innerHTML = `<strong>${item.meal_time}</strong><br>${item.food_items}`;
        menuList.appendChild(menuItem);
      });
    } else {
      menuList.innerHTML = "<li>Menu not available for today.</li>";
    }
  }

  async function getBulletin() {
    const bulletinList = document.getElementById("bulletin-list");
    if (!bulletinList) return;

    const { data, error } = await supabase
      .from("bulletin")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bulletin:", error);
      bulletinList.innerHTML =
        '<div class="bulletin-item">Error loading bulletins.</div>';
      return;
    }

    if (data && data.length > 0) {
      bulletinList.innerHTML = "";
      data.forEach((item) => {
        const bulletinItem = document.createElement("div");
        bulletinItem.className = "bulletin-item";
        bulletinItem.innerHTML = `<strong>${item.title}</strong><br>${item.content}`;
        bulletinList.appendChild(bulletinItem);
      });
    } else {
      bulletinList.innerHTML =
        '<div class="bulletin-item">No new announcements.</div>';
    }
  }

  getMessMenu();
  getBulletin();
  let currentSlide = 0;
  const slider = document.querySelector(".slider");
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".slider-dot");
  const totalSlides = slides.length;
  let slideInterval;

  function goToSlide(index) {
    if (slider) {
      slider.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
      currentSlide = index;
    }
  }

  function startSlider() {
    slideInterval = setInterval(() => {
      const nextIndex = (currentSlide + 1) % totalSlides;
      goToSlide(nextIndex);
    }, 4000);
  }

  function stopSlider() {
    clearInterval(slideInterval);
  }
  
  function nextSlide() {
    const nextIndex = (currentSlide + 1) % totalSlides;
    goToSlide(nextIndex);
  }
  
  function prevSlide() {
    const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
    goToSlide(prevIndex);
  }

  if (slider && slides.length > 0 && dots.length > 0) {
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        goToSlide(index);
      });
    });

    const sliderContainer = document.querySelector(".slider-container");
    if (sliderContainer) {
      sliderContainer.addEventListener("mouseenter", stopSlider);
      sliderContainer.addEventListener("mouseleave", startSlider);
    }
    
    // Add event listeners for the arrow buttons
    const prevButton = document.getElementById("prev-slide");
    const nextButton = document.getElementById("next-slide");

    if (prevButton && nextButton) {
        prevButton.addEventListener("click", () => {
          stopSlider(); 
          prevSlide();
          startSlider();
        });
        nextButton.addEventListener("click", () => {
          stopSlider(); 
          nextSlide();
          startSlider();
        });
      }
    
    startSlider();
  }

  // --- Existing FAQ functionality ---
  const faqQuestions = document.querySelectorAll(".faq-question");
  if (faqQuestions.length > 0) {
    faqQuestions.forEach((question) => {
      question.addEventListener("click", () => {
        const faqItem = question.parentElement;
        faqItem.classList.toggle("active");
      });
    });
  }

  // --- Existing Weather functionality ---
  function fetchWeather() {
    const latitude = 28.9;
    const longitude = 76.61;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m,apparent_temperature`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.current_weather) {
          const weather = data.current_weather;
          const hourly = data.hourly;

          document.getElementById("weather-temp").textContent = `${Math.round(
            weather.temperature
          )}°C`;
          document.getElementById(
            "weather-wind"
          ).textContent = `${weather.windspeed} km/h`;

          const now = new Date();
          const currentHourISO = now.toISOString().slice(0, 14) + "00";
          const timeIndex = hourly.time.findIndex((t) =>
            t.startsWith(currentHourISO.slice(0, 13))
          );

          if (timeIndex !== -1) {
            document.getElementById(
              "weather-humidity"
            ).textContent = `${hourly.relativehumidity_2m[timeIndex]}%`;
            document.getElementById(
              "weather-feels-like"
            ).textContent = `${Math.round(
              hourly.apparent_temperature[timeIndex]
            )}°C`;
          }

          document.getElementById("weather-condition").textContent =
            interpretWeatherCode(weather.weathercode);
        }
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
        document.getElementById("weather-condition").textContent =
          "Failed to load";
      });
  }

  function interpretWeatherCode(code) {
    const weatherCodes = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      56: "Light freezing drizzle",
      57: "Dense freezing drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      66: "Light freezing rain",
      67: "Heavy freezing rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    };
    return weatherCodes[code] || "Unknown";
  }

  fetchWeather();
  setInterval(fetchWeather, 1800000);

  // New code for latest lost & found items
  async function getLatestLostFound() {
    const latestContainer = document.getElementById("latest-lost-found");
    if (!latestContainer) return;

    const { data, error } = await supabase
      .from("lost_and_found")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching latest lost & found items:", error);
      latestContainer.innerHTML = '<div class="loading-item">Error loading items.</div>';
      return;
    }

    if (data && data.length > 0) {
      latestContainer.innerHTML = "";
      data.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.className = "lost-found-item";
        
        const date = new Date(item.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const isFound = !!item.found;
        const badgeText = isFound ? "Found" : "Lost";
        
        itemElement.innerHTML = `
          <div class="lost-found-item-header">
            <span class="item-type ${isFound ? 'found' : 'lost'}">${badgeText}</span>
            <span class="item-date">${date}</span>
          </div>
          <div class="item-title">${item.title || "Untitled"}</div>
          <div class="item-description">${item.description || ""}</div>
          <div class="item-location">👤 ${item.name || "Anonymous"}</div>
        `;
        
        latestContainer.appendChild(itemElement);
      });
    } else {
      latestContainer.innerHTML = '<div class="loading-item">No items found.</div>';
    }
  }

  getLatestLostFound();
});
