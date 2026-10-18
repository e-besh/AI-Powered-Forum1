import { useEffect, useState } from "react";
import ThemeContext from "./ThemeContext";

const STORAGE_KEY = "evangadi-forum-theme";
const THEMES = ["light", "dark"];

function getStoredTheme() {
    try {
        const storedTheme = window.localStorage.getItem(STORAGE_KEY);
        return THEMES.includes(storedTheme) ? storedTheme : "light";
    } catch {
        return "light";
    }
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getStoredTheme);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("dark", theme === "dark");
        root.style.colorScheme = theme;

        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            return;
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}