class DateParser {

    parse(text = "") {

        const value = text.trim();

        const regex = /^\d{4}-\d{2}-\d{2}$/;

        if (!regex.test(value)) {
            return null;
        }

        const date = new Date(`${value}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return value;
    }

}

module.exports = new DateParser();