import { useEffect, useState } from "react";
import WeatherCanvas from "./WeatherCanvas";

import "./style.css";
import "./weather.css";

type WeatherData = {
    temperature: number;
    windspeed: number;
    time: string;
    weathercode: number;
};


type ForecastData = {
    date: string;
    max: number;
    min: number;
    code: number;
};

export default function App() {
    const [startY, setStartY] = useState<number | null>(null);
    const [translateY, setTranslateY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [forecast, setForecast] = useState<ForecastData[]>([]);
    const [coords, setCoords] = useState<{ lat: number; lon: number }>({
        lat: 37.57, // 기본: 서울
        lon: 126.98,
    });

    // 📍 현재 위치 가져오기
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCoords({
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                    });
                },
                (err) => {
                    console.warn("위치 접근 실패 → 서울 좌표로 fallback", err);
                }
            );
        }
    }, []);

    useEffect(() => {
        const { lat, lon } = coords;

        const today = new Date();
        const start = today.toISOString().slice(0, 10); // 오늘
        const endDate = new Date();
        endDate.setDate(today.getDate() + 6); // 7일 뒤
        const end = endDate.toISOString().slice(0, 10);
        console.log(lat, lon);
        // 현재 날씨
        fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia%2FSeoul`
        )
            .then((res) => res.json())
            .then((data) => {
                setWeather(data.current_weather);
                setLoading(false);
                console.log(data.current_weather);
            });

        // 주간예보
        fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia%2FSeoul&start_date=${start}&end_date=${end}`
        )
            .then((res) => res.json())
            .then((data) => {
                const mapped: ForecastData[] = data.daily.time.map(
                    (date: string, idx: number) => ({
                        date,
                        max: data.daily.temperature_2m_max[idx],
                        min: data.daily.temperature_2m_min[idx],
                        code: data.daily.weathercode[idx],
                    })
                );
                setForecast(mapped);
            });

    }, []);
    if (loading) return (
        <div className="loading">
            <span>🌤️</span>
            <span>🌦️</span>
            <span>⛅</span>
            <p>날씨 정보를 불러오는 중...</p>
        </div>
    );
    if (!weather) return <div className="error">❌ 날씨 정보를 가져올 수 없습니다.</div>;

    // 드래그 이벤트 핸들러
    // const 함수명 = (이벤트: React.TouchEvent) => { 처음 잡았을때
    const handleTouchStart = (e: React.TouchEvent) => {
        setStartY(e.touches[0].clientY);
        setIsDragging(true);
    };
    // const 힘수명 = (이벤트: React.TouchEvent) => ( 잡고있을때 위치 따라감
    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || startY === null) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        // 아래로만 일정 정도 허용 (쫀득한 느낌)
        if (diff > -400 && diff < 200) {
            setTranslateY(diff);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setStartY(null);

        // 위로 확장 (150px 이상 올렸을 때)
        if (translateY < -150) {
            setTranslateY(-400);
        }
        // 아래로 당긴 경우 (150px 이상 내렸을 때)
        else if (translateY > 150) {
            setTranslateY(0); // 원하는 만큼 아래로 내려간 상태 유지
        }
        // 기본: 원래 자리 복귀
        else {
            setTranslateY(0);
        }
    };

    // 날씨 코드 → 아이콘
    const weatherIcon = (code: number) => {
        if (code === 0 || code === 1) return "☀️";
        if (code === 2) return "⛅";
        if (code === 3) return "☁️";
        if (code >= 51 && code <= 67) return "🌧️";
        if (code >= 71 && code <= 77) return "❄️";
        return "🌡️";
    };

    const OnClick = () => {
        console.log(10)
    }

    const theme =
    weather.weathercode === 0 || weather.weathercode === 1
    ? "clear"   // 맑음
    : weather.weathercode === 2
    ? "cloud"   // 구름 조금
    : weather.weathercode === 3
    ? "cloudy"  // 흐림
    : weather.weathercode >= 51 && weather.weathercode <= 67
    ? "rain"    // 비
    : weather.weathercode >= 71 && weather.weathercode <= 77
    ? "snow"    // 눈
    : weather.weathercode >= 95 && weather.weathercode <= 99
    ? "thunder" // 천둥번개
    : "clear";  // 기본값


    return (
        <div className={`app theme-${theme}`}>
            <WeatherCanvas theme={theme} />
            <div className="weather-top">
                <div className="temperature">{weather.temperature}°</div>
                <div className="location">서울 · 현재 기온</div>
            </div>

            <div
                className={`weather-card ${translateY === 0 ? "snap-back" : ""}`}
                style={{ transform: `translateY(${translateY}px)` }}
                onTouchMove={isDragging ? handleTouchMove : undefined}
                onTouchEnd={isDragging ? handleTouchEnd : undefined}
            >
                {/* 드래그 헤더 전체 */}
                <div
                    className="drag-header"
                    onTouchStart={handleTouchStart}
                >
                    <div className="drag-handle"></div>
                </div>


                {/* 기본 요약 */}
                <div className="details">
                    <div className="detail">
                        <p className="icon">💨</p>
                        <p className="value">{weather.windspeed} km/h</p>
                        <p className="label">풍속</p>
                    </div>
                    <div className="detail">
                        <p className="icon">⏰</p>
                        <p className="value">
                            {new Date(weather.time).toLocaleTimeString("ko-KR")}
                        </p>
                        <p className="label">업데이트</p>
                    </div>
                </div>

                <div className="extended-info">
                    <h4>📅 주간 예보</h4>
                    <div
                        className="forecast-list"
                        onClick={OnClick}
                    >
                        {forecast.map((f, idx) => (
                            <div key={idx} className="forecast-list-card">
                                <div className="forecast-date">
                                    {new Date(f.date).toLocaleDateString("ko-KR", { weekday: "short" })}
                                </div>
                                <div className="forecast-icon">{weatherIcon(f.code)}</div>
                                <div className="forecast-temp">
                                    <span className="max">{f.max}°</span> / <span className="min">{f.min}°</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
