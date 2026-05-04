export class DateHelper {

    static subtractDays(numOfDays: number, date = new Date()) {
        date.setDate(date.getDate() - numOfDays);
        return date;
    }
}
