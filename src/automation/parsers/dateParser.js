class DateParser {

    todayBogota() {
        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Bogota",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).formatToParts(new Date());
        const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
        return `${values.year}-${values.month}-${values.day}`;
    }

    parse(text = "") {

        const value = text.trim().toLowerCase();
        const today = this.todayBogota();
        if (value === "hoy") return today;
        if (value === "mañana" || value === "manana") return this.addDays(today, 1);
        if (value === "pasado mañana" || value === "pasado manana") return this.addDays(today, 2);

        let year, month, day;
        let match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (match) [, year, month, day] = match;
        else {
            match = value.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
            if (!match) return null;
            [, day, month, year] = match;
        }

        const normalized = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return this.isValid(normalized) ? normalized : null;
    }

    isValid(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
        const [year, month, day] = value.split("-").map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
    }

    addDays(value, days) {
        const [year, month, day] = value.split("-").map(Number);
        const date = new Date(Date.UTC(year, month - 1, day + days));
        return date.toISOString().slice(0, 10);
    }

}

module.exports = new DateParser();
