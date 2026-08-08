class TimeHelper {

    toMinutes(time) {

        const [hours, minutes] = time.split(":").map(Number);

        return hours * 60 + minutes;

    }

    toTime(totalMinutes) {

        const hours = Math.floor(totalMinutes / 60);

        const minutes = totalMinutes % 60;

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    }

}

module.exports = new TimeHelper();