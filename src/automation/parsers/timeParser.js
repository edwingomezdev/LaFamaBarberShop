class TimeParser {

    parse(text = "") {

        const value = text.trim();

        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (!regex.test(value)) {
            return null;
        }

        return value;

    }

}

module.exports = new TimeParser();