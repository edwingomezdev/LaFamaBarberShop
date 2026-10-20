class TimeParser {

    parse(text = "") {

        const value = text.trim().toLowerCase().replace(/\./g, "");
        let match = value.match(/^(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)$/);
        if (match) {
            let hours = Number(match[1]);
            const minutes = Number(match[2] || 0);
            const isPm = match[3].startsWith("p");
            if (hours < 1 || hours > 12 || minutes > 59) return null;
            if (hours === 12) hours = 0;
            if (isPm) hours += 12;
            return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        }

        match = value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
        if (!match) return null;
        return `${String(Number(match[1])).padStart(2, "0")}:${match[2]}`;

    }

}

module.exports = new TimeParser();
